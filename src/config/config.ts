import Joi from "joi";

const envSchema = Joi.object({
    // Runtime mode for this API.
    // - local: developer machine (bind localhost by default)
    // - dev: shared dev environment (bind 0.0.0.0 by default)
    // - prod: production (bind 0.0.0.0 by default)
    APP_ENV: Joi.string().valid("local", "dev", "prod").default("local"),

    // Keep NODE_ENV for ecosystem tooling; it can still be used by libs.
    NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),

    // Optional explicit bind host override.
    // Accept common bind values as well as hostnames.
    HOST: Joi.alternatives()
        .try(
            Joi.string().valid("localhost", "0.0.0.0", "127.0.0.1", "::"),
            Joi.string().hostname()
        )
        .optional(),
    PORT: Joi.number().integer().min(1).max(65535).default(4000),
    JWT_SECRET: Joi.string().min(1).default("secret")
}).unknown(true);

const { value: env, error } = envSchema.validate(process.env, { abortEarly: false });
if (error) {
    throw new Error(`Invalid environment configuration: ${error.message}`);
}

const defaultHostByAppEnv: Record<"local" | "dev" | "prod", string> = {
    local: "localhost",
    dev: "0.0.0.0",
    prod: "0.0.0.0"
};

export const config = {
    appEnv: env.APP_ENV as "local" | "dev" | "prod",
    nodeEnv: env.NODE_ENV as "development" | "production" | "test",
    host: (env.HOST ?? defaultHostByAppEnv[env.APP_ENV as "local" | "dev" | "prod"]) as string,
    port: env.PORT as number,
    jwtSecret: env.JWT_SECRET as string
};