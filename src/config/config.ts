export const config = {
    port: 4000,
    jwtSecret: process.env.JWT_SECRET || "secret",
    databaseUrl: process.env.DATABASE_URL || ""
};