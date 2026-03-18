import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { QueryCommand, PutCommand, DeleteCommand, BatchGetCommand } from "@aws-sdk/lib-dynamodb";
import { TableNames } from "../../config/dynamodb.config.ts";
import type { Favorite, Product } from "../../types/dynamodb.ts";

export const listFavorites = async (dynamodb: DynamoDBDocumentClient, userId: string) => {
    const result = await dynamodb.send(new QueryCommand({
        TableName: TableNames.FAVORITES,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": userId
        }
    }));

    const favorites = result.Items as Favorite[] || [];
    const productIds = favorites.map(fav => fav.productId);

    if (productIds.length === 0) {
        return [];
    }

    const keys = productIds.map(id => ({ id }));
    const batchResult = await dynamodb.send(new BatchGetCommand({
        RequestItems: {
            [TableNames.PRODUCTS]: {
                Keys: keys
            }
        }
    }));

    const products = (batchResult.Responses?.[TableNames.PRODUCTS] as Product[]) || [];

    return favorites.map(fav => {
        const product = products.find(p => p.id === fav.productId);
        return {
            ...fav,
            product
        };
    });
};

export const addFavorite = async (dynamodb: DynamoDBDocumentClient, userId: string, productId: string) => {
    const favorite: Favorite = {
        userId,
        productId
    };

    await dynamodb.send(new PutCommand({
        TableName: TableNames.FAVORITES,
        Item: favorite,
        ConditionExpression: "attribute_not_exists(userId) AND attribute_not_exists(productId)"
    }));

    return favorite;
};

export const removeFavorite = async (dynamodb: DynamoDBDocumentClient, userId: string, productId: string) => {
    await dynamodb.send(new DeleteCommand({
        TableName: TableNames.FAVORITES,
        Key: { userId, productId },
        ConditionExpression: "attribute_exists(userId) AND attribute_exists(productId)"
    }));

    return { productId };
};
