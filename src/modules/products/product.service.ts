import type { PrismaClient } from "@prisma/client";

export const listProducts = (prisma: PrismaClient) => {
    return prisma.product.findMany();
};

export const getProduct = (prisma: PrismaClient, id: string) => {
    return prisma.product.findUnique({ where: { id } });
};

export const createProduct = (prisma: PrismaClient, data: { name: string; description?: string; price: number; stock?: number }) => {
    return prisma.product.create({ data });
};

export const updateProduct = (prisma: PrismaClient, id: string, data: { name?: string; description?: string; price?: number; stock?: number }) => {
    return prisma.product.update({ where: { id }, data });
};

export const deleteProduct = (prisma: PrismaClient, id: string) => {
    return prisma.product.delete({ where: { id } });
};
