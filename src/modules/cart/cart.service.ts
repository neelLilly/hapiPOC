import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { QueryCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand, BatchGetCommand } from "@aws-sdk/lib-dynamodb";
import { TableNames } from "../../config/dynamodb.config.ts";
import type { Cart, CartItem, Product } from "../../types/dynamodb.ts";

export const getOrCreateCart = async (dynamodb: DynamoDBDocumentClient, userId: string) => {
    const cartResult = await dynamodb.send(new GetCommand({
        TableName: TableNames.CARTS,
        Key: { userId }
    }));

    let cart: Cart;
    if (!cartResult.Item) {
        cart = {
            userId,
            updatedAt: new Date().toISOString()
        };

        await dynamodb.send(new PutCommand({
            TableName: TableNames.CARTS,
            Item: cart
        }));
    } else {
        cart = cartResult.Item as Cart;
    }

    const itemsResult = await dynamodb.send(new QueryCommand({
        TableName: TableNames.CART_ITEMS,
        KeyConditionExpression: "cartId = :cartId",
        ExpressionAttributeValues: {
            ":cartId": userId
        }
    }));

    const items = itemsResult.Items as CartItem[] || [];

    const productIds = items.map(item => item.productId);
    let products: Product[] = [];

    if (productIds.length > 0) {
        const keys = productIds.map(id => ({ id }));
        const batchResult = await dynamodb.send(new BatchGetCommand({
            RequestItems: {
                [TableNames.PRODUCTS]: {
                    Keys: keys
                }
            }
        }));

        products = (batchResult.Responses?.[TableNames.PRODUCTS] as Product[]) || [];
    }

    const itemsWithProducts = items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
            ...item,
            product
        };
    });

    return {
        ...cart,
        items: itemsWithProducts
    };
};

export const addItemToCart = async (dynamodb: DynamoDBDocumentClient, userId: string, productId: string, quantity: number) => {
    const cart = await getOrCreateCart(dynamodb, userId);

    const updatedItem = await dynamodb.send(new UpdateCommand({
        TableName: TableNames.CART_ITEMS,
        Key: { cartId: userId, productId },
        UpdateExpression: "SET quantity = if_not_exists(quantity, :zero) + :inc",
        ExpressionAttributeValues: {
            ":zero": 0,
            ":inc": quantity
        },
        ReturnValues: "ALL_NEW"
    }));

    await dynamodb.send(new UpdateCommand({
        TableName: TableNames.CARTS,
        Key: { userId: cart.userId },
        UpdateExpression: "SET updatedAt = :updatedAt",
        ExpressionAttributeValues: {
            ":updatedAt": new Date().toISOString()
        }
    }));

    return updatedItem.Attributes;
};

export const updateCartItemQuantity = async (dynamodb: DynamoDBDocumentClient, userId: string, productId: string, quantity: number) => {
    const result = await dynamodb.send(new UpdateCommand({
        TableName: TableNames.CART_ITEMS,
        Key: { cartId: userId, productId },
        UpdateExpression: "SET quantity = :quantity",
        ExpressionAttributeValues: {
            ":quantity": quantity
        },
        ReturnValues: "ALL_NEW"
    }));
    return result.Attributes;
};

export const removeCartItem = async (dynamodb: DynamoDBDocumentClient, userId: string, productId: string) => {
    await dynamodb.send(new DeleteCommand({
        TableName: TableNames.CART_ITEMS,
        Key: { cartId: userId, productId }
    }));
    return { productId };
};

export const clearCart = async (dynamodb: DynamoDBDocumentClient, userId: string) => {
    const cartResult = await dynamodb.send(new GetCommand({
        TableName: TableNames.CARTS,
        Key: { userId }
    }));

    if (!cartResult.Item) {
        return;
    }

    const itemsResult = await dynamodb.send(new QueryCommand({
        TableName: TableNames.CART_ITEMS,
        KeyConditionExpression: "cartId = :cartId",
        ExpressionAttributeValues: {
            ":cartId": userId
        }
    }));

    const items = itemsResult.Items as CartItem[] || [];

    for (const item of items) {
        await dynamodb.send(new DeleteCommand({
            TableName: TableNames.CART_ITEMS,
            Key: { cartId: userId, productId: item.productId }
        }));
    }
};

