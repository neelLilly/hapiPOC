import Jwt from "@hapi/jwt";
import bcrypt from "bcrypt";
import type { PrismaClient } from "@prisma/client";
import { config } from "../../config/config.ts";

const SALT_ROUNDS = 10;

export const register = async (prisma: PrismaClient, email: string, password: string) => {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new Error("User already exists");
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashed
        }
    });

    return { id: user.id, email: user.email };
};

export const login = async (prisma: PrismaClient, email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error("Invalid credentials");
    }

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