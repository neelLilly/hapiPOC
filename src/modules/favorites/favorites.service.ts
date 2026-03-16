import type { PrismaClient } from "@prisma/client";

export const listFavorites = (prisma: PrismaClient, userId: string) => {
    return prisma.favorite.findMany({
        where: { userId },
        include: { product: true }
    });
};

export const addFavorite = (prisma: PrismaClient, userId: string, productId: string) => {
    return prisma.favorite.create({
        data: {
            userId,
            productId
        }
    });
};

export const removeFavorite = (prisma: PrismaClient, userId: string, productId: string) => {
    return prisma.favorite.delete({
        where: {
            userId_productId: {
                userId,
                productId
            }
        }
    });
};
