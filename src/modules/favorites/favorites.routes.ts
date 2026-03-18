import type { ServerRoute } from "@hapi/hapi";
import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { addFavoriteSchema, favoriteProductIdParamSchema } from "./favorites.schema.ts";
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
            const dynamodb = request.server.app.dynamodb as DynamoDBDocumentClient;
            const { userId } = request.auth.credentials as { userId: string };

            const favorites = await listFavorites(dynamodb, userId);
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
            const dynamodb = request.server.app.dynamodb as DynamoDBDocumentClient;
            const { userId } = request.auth.credentials as { userId: string };
            const { productId } = request.payload as { productId: string };

            try {
                const favorite = await addFavorite(dynamodb, userId, productId);
                return h.response(favorite).code(201);
            } catch (err: any) {
                if (err?.name === "ConditionalCheckFailedException") {
                    return h.response({ message: "Favorite already exists" }).code(400);
                }
                return h.response({ message: err?.message ?? "Failed to add favorite" }).code(400);
            }
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
            },
            validate: {
                params: favoriteProductIdParamSchema
            }
        },
        handler: async (request, h) => {
            const dynamodb = request.server.app.dynamodb as DynamoDBDocumentClient;
            const { userId } = request.auth.credentials as { userId: string };
            const { productId } = request.params as { productId: string };

            try {
                await removeFavorite(dynamodb, userId, productId);
                return h.response().code(204);
            } catch (err: any) {
                if (err?.name === "ConditionalCheckFailedException") {
                    return h.response({ message: "Favorite not found" }).code(404);
                }
                return h.response({ message: err?.message ?? "Failed to remove favorite" }).code(404);
            }
        }
    }
];

export default favoritesRoutes;
