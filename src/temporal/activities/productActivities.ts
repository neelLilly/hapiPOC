import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { TableNames } from "../../config/dynamodb.config.ts";
import type { Product } from "../../types/dynamodb.ts";

let dynamodb: DynamoDBDocumentClient;

export function setDynamoDBClient(client: DynamoDBDocumentClient) {
    dynamodb = client;
}

export interface CreateProductInput {
    name: string;
    description?: string;
    price: number;
    stock?: number;
}

export async function createProductActivity(input: CreateProductInput): Promise<Product> {
    if (!dynamodb) {
        throw new Error("DynamoDB client not initialized");
    }

    const product: Product = {
        id: uuidv4(),
        entityType: "PRODUCT",
        name: input.name,
        ...(input.description !== undefined && { description: input.description }),
        price: input.price,
        stock: input.stock ?? 0,
        createdAt: new Date().toISOString()
    };

    await dynamodb.send(new PutCommand({
        TableName: TableNames.PRODUCTS,
        Item: product
    }));

    return product;
}
