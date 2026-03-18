import { Connection, Client } from "@temporalio/client";

let client: Client | null = null;

export async function initializeTemporalClient() {
    if (client) {
        return client;
    }

    const connection = await Connection.connect({
        address: "localhost:7233"
    });

    client = new Client({
        connection,
        namespace: "default"
    });

    return client;
}

export async function getTemporalClient(): Promise<Client> {
    if (!client) {
        return initializeTemporalClient();
    }
    return client;
}

export async function closeTemporalClient() {
    if (client) {
        await client.connection.close();
        client = null;
    }
}
