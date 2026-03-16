import Hapi, { type ServerRegisterPluginObject } from "@hapi/hapi";
import Inert from "@hapi/inert";
import Vision from "@hapi/vision";
import HapiSwagger from "hapi-swagger";

const swaggerPlugin: ServerRegisterPluginObject<Hapi.Server> = {
    plugin: {
        name: "swagger",
        register: async (server) => {
            const swaggerOptions = {
                info: {
                    title: "Hapi Cart Service API",
                    version: "1.0.0",
                    description: `
Authentication flow:
Credentials: test@gmail.com / password@123
1. Call POST /register once with email and password to create a user.
2. Call POST /login with the same email and password.
3. Copy the "token" value from the /login response.
4. Click the Authorize (lock) button at the top of the docs.
5. For the jwt apiKey value, paste: Bearer <your-token-here>.
6. Execute any protected routes (cart, favorites, protected, product mutations).
`
                },
                documentationPath: "/docs",
                securityDefinitions: {
                    jwt: {
                        type: "apiKey",
                        name: "Authorization",
                        in: "header"
                    }
                },
                // Apply JWT auth by default so Swagger sends the header
                security: [{ jwt: [] }]
            };

            await server.register([
                Inert,
                Vision,
                {
                    plugin: HapiSwagger,
                    options: swaggerOptions,
                }
            ])
        }
    }
}

export default swaggerPlugin;