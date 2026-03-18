import { proxyActivities, defineSignal, setHandler } from "@temporalio/workflow";
import * as activities from "../activities/productActivities.ts";

const { createProductActivity } = proxyActivities<typeof activities>({
    startToCloseTimeout: "1 minute"
});

export interface CreateProductInput {
    name: string;
    description?: string;
    price: number;
    stock?: number;
}

export async function createProductWorkflow(input: CreateProductInput) {
    // Call the activity to create the product
    const product = await createProductActivity(input);
    return product;
}
