import type Hapi from "@hapi/hapi";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { createDynamoDbDocumentClient } from "../dynamodb/client.ts";

declare module "@hapi/hapi" {
    interface ServerApplicationState {
        dynamodb: DynamoDBDocumentClient;
    }
}

const dynamoDbPlugin: Hapi.ServerRegisterPluginObject<void> = {
    plugin: {
        name: "dynamodb",
        register: async (server: Hapi.Server) => {
            const { client, docClient } = createDynamoDbDocumentClient();

            server.app.dynamodb = docClient;

            server.ext("onPostStop", async () => {
                client.destroy();
            });
        }
    }
};

export default dynamoDbPlugin;
