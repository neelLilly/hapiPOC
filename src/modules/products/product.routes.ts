import type { ServerRoute } from "@hapi/hapi";
import type { PrismaClient } from "@prisma/client";
import { createProductSchema, updateProductSchema, bulkCreateProductsSchema } from "./product.schema.ts";

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
            const prisma = request.server.app.prisma as PrismaClient;
            const products = await prisma.product.findMany();
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
            const prisma = request.server.app.prisma as PrismaClient;
            const { id } = request.params as { id: string };
            const product = await prisma.product.findUnique({ where: { id } });
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
            const prisma = request.server.app.prisma as PrismaClient;
            const payload = request.payload as any;
            const product = await prisma.product.create({ data: payload });
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
            const prisma = request.server.app.prisma as PrismaClient;
            const payload = request.payload as any[]; // array of products

            const created = await prisma.product.createMany({
                data: payload,
                skipDuplicates: true
            });

            return h.response(created).code(201);
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
            const prisma = request.server.app.prisma as PrismaClient;
            const { id } = request.params as { id: string };
            const payload = request.payload as any;
            try {
                const product = await prisma.product.update({ where: { id }, data: payload });
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
            const prisma = request.server.app.prisma as PrismaClient;
            const { id } = request.params as { id: string };
            try {
                await prisma.product.delete({ where: { id } });
                return h.response().code(204);
            } catch (err: any) {
                return h.response({ message: "Product not found" }).code(404);
            }
        }
    }
];

export default productRoutes;
