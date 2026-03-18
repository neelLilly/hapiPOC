import type { CreateTableCommandInput } from "@aws-sdk/client-dynamodb";

export const dynamoTables: CreateTableCommandInput[] = [
    {
        TableName: "Users",
        BillingMode: "PAY_PER_REQUEST",
        KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "email", AttributeType: "S" }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "EmailIndex",
                KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
                Projection: { ProjectionType: "ALL" }
            }
        ]
    },
    {
        TableName: "Products",
        BillingMode: "PAY_PER_REQUEST",
        KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "entityType", AttributeType: "S" },
            { AttributeName: "createdAt", AttributeType: "S" }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "ProductsByCreatedAt",
                KeySchema: [
                    { AttributeName: "entityType", KeyType: "HASH" },
                    { AttributeName: "createdAt", KeyType: "RANGE" }
                ],
                Projection: { ProjectionType: "ALL" }
            }
        ]
    },
    {
        TableName: "Carts",
        BillingMode: "PAY_PER_REQUEST",
        // One cart per user: primary key is the userId.
        KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
        AttributeDefinitions: [{ AttributeName: "userId", AttributeType: "S" }]
    },
    {
        TableName: "CartItems",
        BillingMode: "PAY_PER_REQUEST",
        // Items are uniquely identified by (cartId, productId).
        KeySchema: [
            { AttributeName: "cartId", KeyType: "HASH" },
            { AttributeName: "productId", KeyType: "RANGE" }
        ],
        AttributeDefinitions: [
            { AttributeName: "cartId", AttributeType: "S" },
            { AttributeName: "productId", AttributeType: "S" }
        ]
    },
    {
        TableName: "Favorites",
        BillingMode: "PAY_PER_REQUEST",
        // Favorites are uniquely identified by (userId, productId).
        KeySchema: [
            { AttributeName: "userId", KeyType: "HASH" },
            { AttributeName: "productId", KeyType: "RANGE" }
        ],
        AttributeDefinitions: [
            { AttributeName: "userId", AttributeType: "S" },
            { AttributeName: "productId", AttributeType: "S" }
        ]
    }
];

