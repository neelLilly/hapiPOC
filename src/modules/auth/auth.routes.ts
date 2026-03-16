import type { ServerRoute } from "@hapi/hapi";
import { loginSchema, registerSchema } from "./auth.schema.ts";
import { loginHandler, registerHandler } from "./controller.ts";

const routes: ServerRoute[] = [
    {
        method: "POST",
        path: '/login',
        options: {
            auth: false,
            tags: ['api', 'auth'],
            description: 'Login route',
            validate: {
                payload: loginSchema
            },
            handler: loginHandler
        }
    },
    {
        method: "POST",
        path: "/register",
        options: {
            auth: false,
            tags: ["api", "auth"],
            description: "Register a new user",
            validate: {
                payload: registerSchema
            },
            handler: registerHandler
        }
    },
]

export default routes;