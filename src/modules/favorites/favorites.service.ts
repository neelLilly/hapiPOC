import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { QueryCommand, PutCommand, DeleteCommand, BatchGetCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { TableNames } from "../../config/dynamodb.config.ts";
import type { Favorite, Product } from "../../types/dynamodb.ts";

export const listFavorites = async (dynamodb: DynamoDBDocumentClient, userId: string) => {
    const result = await dynamodb.send(new QueryCommand({
        TableName: TableNames.FAVORITES,
        IndexName: "UserIdIndex",
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
    const existingResult = await dynamodb.send(new QueryCommand({
        TableName: TableNames.FAVORITES,
        IndexName: "UserIdIndex",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": userId
        }
    }));

    const existing = (existingResult.Items as Favorite[] || []).find(
        fav => fav.productId === productId
    );

    if (existing) {
        throw new Error("Favorite already exists");
    }

    const favorite: Favorite = {
        id: uuidv4(),
        userId,
        productId
    };

    await dynamodb.send(new PutCommand({
        TableName: TableNames.FAVORITES,
        Item: favorite
    }));

    return favorite;
};

export const removeFavorite = async (dynamodb: DynamoDBDocumentClient, userId: string, productId: string) => {
    const result = await dynamodb.send(new QueryCommand({
        TableName: TableNames.FAVORITES,
        IndexName: "UserIdIndex",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": userId
        }
    }));

    const favorite = (result.Items as Favorite[] || []).find(
        fav => fav.productId === productId
    );

    if (!favorite) {
        throw new Error("Favorite not found");
    }

    await dynamodb.send(new DeleteCommand({
        TableName: TableNames.FAVORITES,
        Key: { id: favorite.id }
    }));

    return { id: favorite.id };
};
