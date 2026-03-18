import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { QueryCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { TableNames } from "../../config/dynamodb.config.ts";
import type { Product } from "../../types/dynamodb.ts";

export const listProducts = async (
    dynamodb: DynamoDBDocumentClient,
    opts?: { limit?: number; cursor?: Record<string, any> }
) => {
    const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 200);

    const result = await dynamodb.send(new QueryCommand({
        TableName: TableNames.PRODUCTS,
        IndexName: "ProductsByCreatedAt",
        KeyConditionExpression: "entityType = :entityType",
        ExpressionAttributeValues: {
            ":entityType": "PRODUCT"
        },
        ScanIndexForward: false,
        Limit: limit,
        ...(opts?.cursor ? { ExclusiveStartKey: opts.cursor } : {})
    }));

    return {
        items: (result.Items || []) as Product[],
        cursor: result.LastEvaluatedKey ?? null
    };
};

export const getProduct = async (dynamodb: DynamoDBDocumentClient, id: string) => {
    const result = await dynamodb.send(new GetCommand({
        TableName: TableNames.PRODUCTS,
        Key: { id }
    }));
    return result.Item;
};

export const createProduct = async (dynamodb: DynamoDBDocumentClient, data: { name: string; description?: string; price: number; stock?: number }) => {
    const product: Product = {
        id: uuidv4(),
        entityType: "PRODUCT",
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock ?? 0,
        createdAt: new Date().toISOString()
    };

    await dynamodb.send(new PutCommand({
        TableName: TableNames.PRODUCTS,
        Item: product
    }));

    return product;
};

export const updateProduct = async (dynamodb: DynamoDBDocumentClient, id: string, data: { name?: string; description?: string; price?: number; stock?: number }) => {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (data.name !== undefined) {
        updateExpressions.push("#name = :name");
        expressionAttributeNames["#name"] = "name";
        expressionAttributeValues[":name"] = data.name;
    }
    if (data.description !== undefined) {
        updateExpressions.push("#description = :description");
        expressionAttributeNames["#description"] = "description";
        expressionAttributeValues[":description"] = data.description;
    }
    if (data.price !== undefined) {
        updateExpressions.push("#price = :price");
        expressionAttributeNames["#price"] = "price";
        expressionAttributeValues[":price"] = data.price;
    }
    if (data.stock !== undefined) {
        updateExpressions.push("#stock = :stock");
        expressionAttributeNames["#stock"] = "stock";
        expressionAttributeValues[":stock"] = data.stock;
    }

    if (updateExpressions.length === 0) {
        throw new Error("No fields to update");
    }

    const result = await dynamodb.send(new UpdateCommand({
        TableName: TableNames.PRODUCTS,
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW"
    }));

    return result.Attributes;
};

export const deleteProduct = async (dynamodb: DynamoDBDocumentClient, id: string) => {
    await dynamodb.send(new DeleteCommand({
        TableName: TableNames.PRODUCTS,
        Key: { id }
    }));
    return { id };
};

