import "dotenv/config";
import { CreateTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

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
              credentials: {
                  accessKeyId: "dummy",
                  secretAccessKey: "dummy"
              }
          }
          : {})
});

const tables = [
    {
        TableName: "Users",
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" }
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "email", AttributeType: "S" }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "EmailIndex",
                KeySchema: [
                    { AttributeName: "email", KeyType: "HASH" }
                ],
                Projection: { ProjectionType: "ALL" },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                }
            }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    },
    {
        TableName: "Products",
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" }
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    },
    {
        TableName: "Carts",
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" }
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "userId", AttributeType: "S" }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "UserIdIndex",
                KeySchema: [
                    { AttributeName: "userId", KeyType: "HASH" }
                ],
                Projection: { ProjectionType: "ALL" },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                }
            }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    },
    {
        TableName: "CartItems",
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" }
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "cartId", AttributeType: "S" }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "CartIdIndex",
                KeySchema: [
                    { AttributeName: "cartId", KeyType: "HASH" }
                ],
                Projection: { ProjectionType: "ALL" },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                }
            }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    },
    {
        TableName: "Favorites",
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" }
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "userId", AttributeType: "S" }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "UserIdIndex",
                KeySchema: [
                    { AttributeName: "userId", KeyType: "HASH" }
                ],
                Projection: { ProjectionType: "ALL" },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                }
            }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    }
];

async function tableExists(tableName: string): Promise<boolean> {
    try {
        await client.send(new DescribeTableCommand({ TableName: tableName }));
        return true;
    } catch (error: any) {
        if (error.name === "ResourceNotFoundException") {
            return false;
        }
        throw error;
    }
}

async function setupTables() {
    console.log("Setting up DynamoDB tables...\n");

    for (const tableConfig of tables) {
        try {
            const exists = await tableExists(tableConfig.TableName);
            
            if (exists) {
                console.log(`✓ Table "${tableConfig.TableName}" already exists`);
            } else {
                console.log(`Creating table "${tableConfig.TableName}"...`);
                await client.send(new CreateTableCommand(tableConfig));
                console.log(`✓ Table "${tableConfig.TableName}" created successfully`);
            }
        } catch (error: any) {
            console.error(`✗ Error with table "${tableConfig.TableName}":`, error.message);
        }
    }

    console.log("\n✓ DynamoDB setup complete!");
    client.destroy();
}

setupTables().catch((error) => {
    console.error("Setup failed:", error);
    process.exit(1);
});
