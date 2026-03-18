import { Worker } from "@temporalio/worker";
import * as workflows from "../workflows/productWorkflows.ts";
import * as activities from "../activities/productActivities.ts";
import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { fileURLToPath } from "url";
import path from "path";

export async function createProductWorker(dynamodb: DynamoDBDocumentClient) {
    activities.setDynamoDBClient(dynamodb);

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const workflowsPath = path.join(__dirname, "../workflows");

    const worker = await Worker.create({
        workflowsPath,
        activities,
        taskQueue: "product-tasks"
    });

    return worker;
}
