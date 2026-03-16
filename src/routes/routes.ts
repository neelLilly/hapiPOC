import Joi from "joi";
import type Hapi from "@hapi/hapi";

export const routes = [
    {
        method: "GET",
        path: '/',
        options: {
            auth: false,
            description: "API is Live !!!",
            notes: "Returns 200 if the server is running",
            tags: ["api"],
        },
        handler: () => "API is Live !!!"
    },
    {
        method: "GET",
        path: '/health',
        options: {
            auth: false,
            description: "Health Check Endpoint",
            notes: "Returns 200 if the server is running",
            tags: ["api", "health"],
            validate: {
                query: Joi.object({
                    name: Joi.string().optional(),
                })
            }
        },
        handler: (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
            const name = request.query['name'] || "World";
            return h.response(`Hello, ${name}!`).code(200);
        }
    }
]