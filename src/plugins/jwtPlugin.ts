import Jwt, { type HapiJwt } from "@hapi/jwt";
import Hapi from "@hapi/hapi";
import { config } from "../config/config.ts";

export default {
    plugin: {
        name: "jwt",
        register: async (server: Hapi.Server) => {
            await server.register(Jwt)

            server.auth.strategy("jwt", 'jwt', {
                keys: config.jwtSecret,
                verify: {
                    aud: false,
                    iss: false,
                    sub: false,
                    maxAgeSec: 14400
                },
                validate: (artifacts: HapiJwt.Artifacts, request: Hapi.Request, h: Hapi.ResponseToolkit) => {
                    return {
                        isValid: true,
                        credentials: artifacts.decoded.payload
                    }
                }
            });

            server.auth.default("jwt");
        }
    }
}
