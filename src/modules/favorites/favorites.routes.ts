import type { ServerRoute } from "@hapi/hapi";
import type { PrismaClient } from "@prisma/client";
import { addFavoriteSchema } from "./favorites.schema.ts";
import { listFavorites, addFavorite, removeFavorite } from "./favorites.service.ts";

const favoritesRoutes: ServerRoute[] = [
    {
        method: "GET",
        path: "/favorites",
        options: {
            auth: "jwt",
            tags: ["api", "favorites"],
            description: "List current user's favorite products",
            plugins: {
                "hapi-swagger": {
                    security: [{ jwt: [] }]
                }
            }
        },
        handler: async (request, h) => {
            const prisma = request.server.app.prisma as PrismaClient;
            const { userId } = request.auth.credentials as { userId: string };

            const favorites = await listFavorites(prisma, userId);
            return h.response(favorites).code(200);
        }
    },
    {
        method: "POST",
        path: "/favorites",
        options: {
            auth: "jwt",
            tags: ["api", "favorites"],
            description: "Add a product to favorites",
            plugins: {
                "hapi-swagger": {
                    security: [{ jwt: [] }]
                }
            },
            validate: {
                payload: addFavoriteSchema
            }
        },
        handler: async (request, h) => {
            const prisma = request.server.app.prisma as PrismaClient;
            const { userId } = request.auth.credentials as { userId: string };
            const { productId } = request.payload as { productId: string };

            const favorite = await addFavorite(prisma, userId, productId);
            return h.response(favorite).code(201);
        }
    },
    {
        method: "DELETE",
        path: "/favorites/{productId}",
        options: {
            auth: "jwt",
            tags: ["api", "favorites"],
            description: "Remove a product from favorites",
            plugins: {
                "hapi-swagger": {
                    security: [{ jwt: [] }]
                }
            }
        },
        handler: async (request, h) => {
            const prisma = request.server.app.prisma as PrismaClient;
            const { userId } = request.auth.credentials as { userId: string };
            const { productId } = request.params as { productId: string };

            await removeFavorite(prisma, userId, productId);
            return h.response().code(204);
        }
    }
];

export default favoritesRoutes;
