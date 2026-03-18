import type { Request, ResponseToolkit } from "@hapi/hapi";
import { login, register } from "./auth.service.ts";
import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const registerHandler = async (request: Request, h: ResponseToolkit) => {
    const { email, password } = request.payload as { email: string; password: string };
    const dynamodb = request.server.app.dynamodb as DynamoDBDocumentClient;
    console.log("registerHandler------------", email, password);
    try {
        const user = await register(dynamodb, email, password);
        return h.response(user).code(201);
    } catch (err: any) {
        console.log("registerHandler error------------", err);
        return h.response({ message: err.message ?? "Registration failed" }).code(400);
    }
};

export const loginHandler = async (request: Request, h: ResponseToolkit) => {
    const { email, password } = request.payload as { email: string; password: string };
    const dynamodb = request.server.app.dynamodb as DynamoDBDocumentClient;

    try {
        const token = await login(dynamodb, email, password);
        return h.response({ token }).code(200);
    } catch (err: any) {
        return h.response({ message: err.message ?? "Login failed" }).code(401);
    }
};