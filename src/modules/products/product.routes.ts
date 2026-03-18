import type { ServerRoute } from "@hapi/hapi";
import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { createProductSchema, updateProductSchema, bulkCreateProductsSchema } from "./product.schema.ts";
import * as productService from "./product.service.ts";
import { v4 as uuidv4 } from "uuid";
import { BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { TableNames } from "../../config/dynamodb.config.ts";

const productRoutes: ServerRoute[] = [
    {
        method: "GET",
        path: "/products",
        options: {
            auth: false,
            tags: ["api", "products"],
            description: "List all products",
        },
        handler: async (request, h) => {
            const dynamodb = request.server.app.dynamodb as DynamoDBDocumentClient;
            const products = await productService.listProducts(dynamodb);
            return h.response(products).code(200);
        }
    },
    {
        method: "GET",
        path: "/products/{id}",
        options: {
            auth: false,
            tags: ["api", "products"],
            description: "Get a single product",
        },
        handler: async (request, h) => {
            const dynamodb = request.server.app.dynamodb as DynamoDBDocumentClient;
            const { id } = request.params as { id: string };
            const product = await productService.getProduct(dynamodb, id);
            if (!product) {
                return h.response({ message: "Product not found" }).code(404);
            }
            return h.response(product).code(200);
        }
    },
    {
        method: "POST",
        path: "/products",
        options: {
            auth: "jwt",
            tags: ["api", "products"],
            description: "Create a product",
            plugins: {
                "hapi-swagger": {
                    security: [{ jwt: [] }]
                }
            },
            validate: {
                payload: createProductSchema
            }
        },
        handler: async (request, h) => {
            const dynamodb = request.server.app.dynamodb as DynamoDBDocumentClient;
            const payload = request.payload as any;
            const product = await productService.createProduct(dynamodb, payload);
            return h.response(product).code(201);
        }
    },
    {
        method: "POST",
        path: "/products/bulk",
        options: {
            auth: "jwt",
            tags: ["api", "products"],
            description: "Create multiple products at once",
            plugins: {
                "hapi-swagger": {
                    security: [{ jwt: [] }]
                }
            },
            validate: {
                payload: bulkCreateProductsSchema
            }
        },
        handler: async (request, h) => {
            const dynamodb = request.server.app.dynamodb as DynamoDBDocumentClient;
            const payload = request.payload as any[];

            const putRequests = payload.map(item => ({
                PutRequest: {
                    Item: {
                        id: uuidv4(),
                        ...item,
                        stock: item.stock ?? 0,
                        createdAt: new Date().toISOString()
                    }
                }
            }));

            await dynamodb.send(new BatchWriteCommand({
                RequestItems: {
                    [TableNames.PRODUCTS]: putRequests
                }
            }));

            return h.response({ count: payload.length }).code(201);
        }
    },
    {
        method: "PUT",
        path: "/products/{id}",
        options: {
            auth: "jwt",
            tags: ["api", "products"],
            description: "Update a product",
            plugins: {
                "hapi-swagger": {
                    security: [{ jwt: [] }]
                }
            },
            validate: {
                payload: updateProductSchema
            }
        },
        handler: async (request, h) => {
            const dynamodb = request.server.app.dynamodb as DynamoDBDocumentClient;
            const { id } = request.params as { id: string };
            const payload = request.payload as any;
            try {
                const product = await productService.updateProduct(dynamodb, id, payload);
                return h.response(product).code(200);
            } catch (err: any) {
                return h.response({ message: "Product not found" }).code(404);
            }
        }
    },
    {
        method: "DELETE",
        path: "/products/{id}",
        options: {
            auth: "jwt",
            tags: ["api", "products"],
            description: "Delete a product",
            plugins: {
                "hapi-swagger": {
                    security: [{ jwt: [] }]
                }
            },
        },
        handler: async (request, h) => {
            const dynamodb = request.server.app.dynamodb as DynamoDBDocumentClient;
            const { id } = request.params as { id: string };
            try {
                await productService.deleteProduct(dynamodb, id);
                return h.response().code(204);
            } catch (err: any) {
                return h.response({ message: "Product not found" }).code(404);
            }
        }
    }
];

export default productRoutes;
