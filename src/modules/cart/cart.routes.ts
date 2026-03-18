import type { ServerRoute } from "@hapi/hapi";
import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { addCartItemSchema, updateCartItemSchema } from "./cart.schema.ts";
import { getOrCreateCart, addItemToCart, updateCartItemQuantity, removeCartItem, clearCart } from "./cart.service.ts";

const cartRoutes: ServerRoute[] = [
    {
        method: "GET",
        path: "/cart",
        options: {
            auth: "jwt",
            tags: ["api", "cart"],
            description: "Get current user's cart",
            plugins: {
                "hapi-swagger": {
                    security: [{ jwt: [] }]
                }
            }
        },
        handler: async (request, h) => {
            const dynamodb = request.server.app.dynamodb as DynamoDBDocumentClient;
            const { userId } = request.auth.credentials as { userId: string };
            const cart = await getOrCreateCart(dynamodb, userId);
            return h.response(cart).code(200);
        }
    },
    {
        method: "POST",
        path: "/cart/items",
        options: {
            auth: "jwt",
            tags: ["api", "cart"],
            description: "Add item to cart",
            plugins: {
                "hapi-swagger": {
                    security: [{ jwt: [] }]
                }
            },
            validate: {
                payload: addCartItemSchema
            }
        },
        handler: async (request, h) => {
            const dynamodb = request.server.app.dynamodb as DynamoDBDocumentClient;
            const { userId } = request.auth.credentials as { userId: string };
            const { productId, quantity } = request.payload as { productId: string; quantity: number };

            const item = await addItemToCart(dynamodb, userId, productId, quantity);
            return h.response(item).code(201);
        }
    },
    {
        method: "PUT",
        path: "/cart/items/{itemId}",
        options: {
            auth: "jwt",
            tags: ["api", "cart"],
            description: "Update cart item quantity",
            plugins: {
                "hapi-swagger": {
                    security: [{ jwt: [] }]
                }
            },
            validate: {
                payload: updateCartItemSchema
            }
        },
        handler: async (request, h) => {
            const dynamodb = request.server.app.dynamodb as DynamoDBDocumentClient;
            const { itemId } = request.params as { itemId: string };
            const { quantity } = request.payload as { quantity: number };

            const item = await updateCartItemQuantity(dynamodb, itemId, quantity);
            return h.response(item).code(200);
        }
    },
    {
        method: "DELETE",
        path: "/cart/items/{itemId}",
        options: {
            auth: "jwt",
            tags: ["api", "cart"],
            description: "Remove item from cart",
            plugins: {
                "hapi-swagger": {
                    security: [{ jwt: [] }]
                }
            }
        },
        handler: async (request, h) => {
            const dynamodb = request.server.app.dynamodb as DynamoDBDocumentClient;
            const { itemId } = request.params as { itemId: string };

            await removeCartItem(dynamodb, itemId);
            return h.response().code(204);
        }
    },
    {
        method: "DELETE",
        path: "/cart",
        options: {
            auth: "jwt",
            tags: ["api", "cart"],
            description: "Clear cart",
            plugins: {
                "hapi-swagger": {
                    security: [{ jwt: [] }]
                }
            }
        },
        handler: async (request, h) => {
            const dynamodb = request.server.app.dynamodb as DynamoDBDocumentClient;
            const { userId } = request.auth.credentials as { userId: string };

            await clearCart(dynamodb, userId);
            return h.response().code(204);
        }
    }
];

export default cartRoutes;
