import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { QueryCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand, BatchGetCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { TableNames } from "../../config/dynamodb.config.ts";
import type { Cart, CartItem, Product } from "../../types/dynamodb.ts";

export const getOrCreateCart = async (dynamodb: DynamoDBDocumentClient, userId: string) => {
    const result = await dynamodb.send(new QueryCommand({
        TableName: TableNames.CARTS,
        IndexName: "UserIdIndex",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": userId
        }
    }));

    let cart: Cart;

    if (!result.Items || result.Items.length === 0) {
        cart = {
            id: uuidv4(),
            userId,
            updatedAt: new Date().toISOString()
        };

        await dynamodb.send(new PutCommand({
            TableName: TableNames.CARTS,
            Item: cart
        }));
    } else {
        cart = result.Items[0] as Cart;
    }

    const itemsResult = await dynamodb.send(new QueryCommand({
        TableName: TableNames.CART_ITEMS,
        IndexName: "CartIdIndex",
        KeyConditionExpression: "cartId = :cartId",
        ExpressionAttributeValues: {
            ":cartId": cart.id
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
    console.log('--------------->TRYING TO ADD ITEM TO CART');
    const cart = await getOrCreateCart(dynamodb, userId);

    const existingItemsResult = await dynamodb.send(new QueryCommand({
        TableName: TableNames.CART_ITEMS,
        IndexName: "CartIdIndex",
        KeyConditionExpression: "cartId = :cartId",
        ExpressionAttributeValues: {
            ":cartId": cart.id
        }
    }));

    const existingItem = (existingItemsResult.Items as CartItem[] || []).find(
        item => item.productId === productId
    );

    if (existingItem) {
        console.log('--------------->',existingItem);
        const updatedItem = await dynamodb.send(new UpdateCommand({
            TableName: TableNames.CART_ITEMS,
            Key: { id: existingItem.id },
            UpdateExpression: "SET quantity = :quantity",
            ExpressionAttributeValues: {
                ":quantity": existingItem.quantity + quantity
            },
            ReturnValues: "ALL_NEW"
        }));
        return updatedItem.Attributes;
    }

    console.log('--------------->CREATING NEW ITEM',
        cart.id,
        productId,
        quantity
    );

    const newItem: CartItem = {
        id: uuidv4(),
        cartId: cart.id,
        productId,
        quantity
    };

    await dynamodb.send(new PutCommand({
        TableName: TableNames.CART_ITEMS,
        Item: newItem
    }));

    await dynamodb.send(new UpdateCommand({
        TableName: TableNames.CARTS,
        Key: { id: cart.id },
        UpdateExpression: "SET updatedAt = :updatedAt",
        ExpressionAttributeValues: {
            ":updatedAt": new Date().toISOString()
        }
    }));

    return newItem;
};

export const updateCartItemQuantity = async (dynamodb: DynamoDBDocumentClient, itemId: string, quantity: number) => {
    const result = await dynamodb.send(new UpdateCommand({
        TableName: TableNames.CART_ITEMS,
        Key: { id: itemId },
        UpdateExpression: "SET quantity = :quantity",
        ExpressionAttributeValues: {
            ":quantity": quantity
        },
        ReturnValues: "ALL_NEW"
    }));
    return result.Attributes;
};

export const removeCartItem = async (dynamodb: DynamoDBDocumentClient, itemId: string) => {
    await dynamodb.send(new DeleteCommand({
        TableName: TableNames.CART_ITEMS,
        Key: { id: itemId }
    }));
    return { id: itemId };
};

export const clearCart = async (dynamodb: DynamoDBDocumentClient, userId: string) => {
    const result = await dynamodb.send(new QueryCommand({
        TableName: TableNames.CARTS,
        IndexName: "UserIdIndex",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": userId
        }
    }));

    if (!result.Items || result.Items.length === 0) {
        return;
    }

    const cart = result.Items[0] as Cart;

    const itemsResult = await dynamodb.send(new QueryCommand({
        TableName: TableNames.CART_ITEMS,
        IndexName: "CartIdIndex",
        KeyConditionExpression: "cartId = :cartId",
        ExpressionAttributeValues: {
            ":cartId": cart.id
        }
    }));

    const items = itemsResult.Items as CartItem[] || [];

    for (const item of items) {
        await dynamodb.send(new DeleteCommand({
            TableName: TableNames.CART_ITEMS,
            Key: { id: item.id }
        }));
    }
};

