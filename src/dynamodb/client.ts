import { DynamoDBClient, type DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export function createDynamoDbClient(): DynamoDBClient {
    const endpoint = process.env.DYNAMODB_ENDPOINT;
    const hasExplicitCreds = Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
    const isLocalDynamo = Boolean(endpoint);
    console.log("isLocalDynamo ->>>>>:", isLocalDynamo);
    const config: DynamoDBClientConfig = {
        region: process.env.AWS_REGION || (isLocalDynamo ? "local" : "us-east-1"),
        ...(endpoint ? { endpoint } : {}),
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
    };

    return new DynamoDBClient(config);
}

export function createDynamoDbDocumentClient(): { client: DynamoDBClient; docClient: DynamoDBDocumentClient } {
    const client = createDynamoDbClient();
    const docClient = DynamoDBDocumentClient.from(client, {
        marshallOptions: {
            removeUndefinedValues: true,
            convertClassInstanceToMap: true
        }
    });

    return { client, docClient };
}

