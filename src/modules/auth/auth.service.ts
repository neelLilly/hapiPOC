import Jwt from "@hapi/jwt";
import bcrypt from "bcrypt";
import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { config } from "../../config/config.ts";
import { TableNames } from "../../config/dynamodb.config.ts";
import type { User } from "../../types/dynamodb.ts";

const SALT_ROUNDS = 10;

export const register = async (dynamodb: DynamoDBDocumentClient, email: string, password: string) => {
    const existingQuery = await dynamodb.send(new QueryCommand({
        TableName: TableNames.USERS,
        IndexName: "EmailIndex",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: {
            ":email": email
        }
    }));

    if (existingQuery.Items && existingQuery.Items.length > 0) {
        throw new Error("User already exists");
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const user: User = {
        id: uuidv4(),
        email,
        password: hashed,
        createdAt: new Date().toISOString()
    };

    await dynamodb.send(new PutCommand({
        TableName: TableNames.USERS,
        Item: user
    }));

    return { id: user.id, email: user.email };
};

export const login = async (dynamodb: DynamoDBDocumentClient, email: string, password: string) => {
    const result = await dynamodb.send(new QueryCommand({
        TableName: TableNames.USERS,
        IndexName: "EmailIndex",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: {
            ":email": email
        }
    }));

    if (!result.Items || result.Items.length === 0) {
        throw new Error("Invalid credentials");
    }

    const user = result.Items[0] as User;

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        throw new Error("Invalid credentials");
    }

    const token = Jwt.token.generate(
        { userId: user.id, email: user.email },
        { key: config.jwtSecret, algorithm: "HS256" },
    );

    return token;
};