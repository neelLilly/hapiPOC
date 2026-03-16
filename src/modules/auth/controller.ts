import type { Request, ResponseToolkit } from "@hapi/hapi";
import { login, register } from "./auth.service.ts";
import type { PrismaClient } from "@prisma/client";

export const registerHandler = async (request: Request, h: ResponseToolkit) => {
    const { email, password } = request.payload as { email: string; password: string };
    const prisma = request.server.app.prisma as PrismaClient;

    try {
        const user = await register(prisma, email, password);
        return h.response(user).code(201);
    } catch (err: any) {
        return h.response({ message: err.message ?? "Registration failed" }).code(400);
    }
};

export const loginHandler = async (request: Request, h: ResponseToolkit) => {
    const { email, password } = request.payload as { email: string; password: string };
    const prisma = request.server.app.prisma as PrismaClient;

    try {
        const token = await login(prisma, email, password);
        return h.response({ token }).code(200);
    } catch (err: any) {
        return h.response({ message: err.message ?? "Login failed" }).code(401);
    }
};