import type Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

declare module "@hapi/hapi" {
    interface ServerApplicationState {
        prisma: PrismaClient;
    }
}

const prismaPlugin: Hapi.ServerRegisterPluginObject<void> = {
    plugin: {
        name: "prisma",
        register: async (server: Hapi.Server) => {
            const prisma = new PrismaClient();

            server.app.prisma = prisma;

            server.ext("onPostStop", async () => {
                await prisma.$disconnect();
            });
        }
    }
};

export default prismaPlugin;
