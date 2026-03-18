import type Hapi from "@hapi/hapi";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

declare module "@hapi/hapi" {
    interface ServerApplicationState {
        dynamodb: DynamoDBDocumentClient;
    }
}

const dynamoDbPlugin: Hapi.ServerRegisterPluginObject<void> = {
    plugin: {
        name: "dynamodb",
        register: async (server: Hapi.Server) => {
            const endpoint = process.env.DYNAMODB_ENDPOINT;
            const hasExplicitCreds = Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
            const isLocalDynamo = Boolean(endpoint);

            const client = new DynamoDBClient({
                region: process.env.AWS_REGION || (isLocalDynamo ? "local" : "us-east-1"),
                ...(endpoint && {
                    endpoint
                }),
                ...(hasExplicitCreds
                    ? {
                        credentials: {
                            accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
                            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
                        }
                    }
                    : isLocalDynamo
                      ? {
                          // Avoid AWS profile/SSO resolution when using local DynamoDB.
                          credentials: {
                              accessKeyId: "dummy",
                              secretAccessKey: "dummy"
                          }
                      }
                      : {})
            });

            const dynamodb = DynamoDBDocumentClient.from(client, {
                marshallOptions: {
                    removeUndefinedValues: true,
                    convertClassInstanceToMap: true
                }
            });

            server.app.dynamodb = dynamodb;

            server.ext("onPostStop", async () => {
                client.destroy();
            });
        }
    }
};

export default dynamoDbPlugin;
