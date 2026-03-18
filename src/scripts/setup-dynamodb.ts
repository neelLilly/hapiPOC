import "dotenv/config";
import { CreateTableCommand, DeleteTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { createDynamoDbClient } from "../dynamodb/client.ts";
import { dynamoTables } from "../dynamodb/tables.ts";

const client = createDynamoDbClient();
const forceRecreate = process.env.DYNAMODB_FORCE_RECREATE === "1" || process.env.DYNAMODB_FORCE_RECREATE === "true";

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

async function waitForTableToBeDeleted(tableName: string, timeoutMs = 60_000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const exists = await tableExists(tableName);
        if (!exists) return;
        await new Promise((r) => setTimeout(r, 1000));
    }
    throw new Error(`Timed out waiting for table "${tableName}" to be deleted`);
}

async function setupTables() {
    console.log("Setting up DynamoDB tables...\n");
    if (forceRecreate) {
        console.log("DYNAMODB_FORCE_RECREATE is enabled: existing tables will be dropped and recreated.\n");
    }

    for (const tableConfig of dynamoTables) {
        if (!tableConfig.TableName) {
            console.error("✗ Invalid table config: missing TableName");
            continue;
        }
        try {
            const exists = await tableExists(tableConfig.TableName);
            
            if (exists) {
                if (forceRecreate) {
                    console.log(`Dropping table "${tableConfig.TableName}"...`);
                    await client.send(new DeleteTableCommand({ TableName: tableConfig.TableName }));
                    console.log(`✓ Table "${tableConfig.TableName}" dropped`);
                    await waitForTableToBeDeleted(tableConfig.TableName);
                    console.log(`Creating table "${tableConfig.TableName}"...`);
                    await client.send(new CreateTableCommand(tableConfig));
                    console.log(`✓ Table "${tableConfig.TableName}" created successfully`);
                } else {
                    console.log(`✓ Table "${tableConfig.TableName}" already exists (schema not validated)`);
                }
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
