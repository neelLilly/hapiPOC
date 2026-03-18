# Hapi Cart Service API

Cart + favorites API built with **Hapi**, **AWS DynamoDB**, and **TypeScript**, documented via **hapi-swagger**.

> **⚠️ Database Migration Notice**: This project has been migrated from a previous relational database to AWS DynamoDB. See [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md) for details.

---

## Tech Stack

- Hapi v21 (Node.js HTTP framework)
- @hapi/jwt for authentication
- hapi-swagger for API docs
- AWS SDK v3 (DynamoDB)
- TypeScript

---

## Prerequisites

- Node.js 18+
- AWS Account with DynamoDB access (or DynamoDB Local for development)
- AWS credentials configured

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create a `.env` file in the project root (you can copy from `.env.example`) and set:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key

# JWT Secret
JWT_SECRET=changeme

# Server Port
PORT=4000
```

> **For Local Development**: See [DYNAMODB_MIGRATION.md](DYNAMODB_MIGRATION.md) for instructions on using DynamoDB Local.

### 3. Setup DynamoDB Tables

Create the required DynamoDB tables:

```bash
npm run setup:dynamodb
```

This creates the following tables:

- `Users` (with EmailIndex GSI)
- `Products`
- `Carts` (with UserIdIndex GSI)
- `CartItems` (with CartIdIndex GSI)
- `Favorites` (with UserIdIndex GSI)

---

## Running the server

```bash
npm run dev
```

The API will start at:

- **Base URL**: `http://localhost:3000`
- **Swagger UI**: `http://localhost:3000/documentation`

---

## Authentication Flow

1. **Register** a user:
   - `POST /register`
   - Body:
     ```json
     {
       "email": "test@gmail.com",
       "password": "password@123"
     }
     ```
2. **Login**:
   - `POST /login`
   - Body:
     ```json
     {
       "email": "test@gmail.com",
       "password": "password@123"
     }
     ```
   - Response contains:
     ```json
     {
       "token": "<JWT_TOKEN>"
     }
     ```
3. **Authorize in Swagger**:
   - Click the **Authorize** (lock) button in `/documentation`.
   - For `jwt (apiKey)` value, paste:
     ```text
     Bearer <JWT_TOKEN>
     ```
   - Now all protected endpoints (cart, favorites, product mutations, `/protected`) will use this JWT.

---

## Domains & Endpoints

### 1. Health & Base

- `GET /` – simple "API is Live !!!" response (no auth).
- `GET /health` – health check with optional `name` query (no auth).

### 2. Auth

- `POST /register` – register a new user.
  - Body: `{ "email": string, "password": string (min 8) }`
- `POST /login` – login and receive a JWT.
  - Body: `{ "email": string, "password": string }`
- `GET /protected` – sample protected route (requires JWT).

Users are stored in the `Users` DynamoDB table with **bcrypt-hashed passwords**. JWT payload includes `userId` and `email`.

### 3. Products

All product data is stored in the `Products` DynamoDB table.

- `GET /products` – list all products (public).
- `GET /products/{id}` – get a single product by id (public).
- `POST /products` – create a product (requires JWT).
  - Body:
    ```json
    {
      "name": "HairDryer",
      "description": "Powerful dryer",
      "price": 49.99,
      "stock": 10
    }
    ```
- `POST /products/bulk` – create multiple products at once (requires JWT).
  - Body: array of objects using the same schema as `POST /products`.
- `PUT /products/{id}` – update a product (requires JWT).
- `DELETE /products/{id}` – delete a product (requires JWT).

### 4. Cart

Per-user cart, backed by `Carts` and `CartItems` DynamoDB tables. All routes require JWT.

- `GET /cart` – get the current user's cart (includes items and products).
- `POST /cart/items` – add item to cart.
  - Body:
    ```json
    {
      "productId": "<product-uuid>",
      "quantity": 1
    }
    ```
  - If the item already exists, quantity is incremented.
- `PUT /cart/items/{itemId}` – update quantity of an item.
  - Body: `{ "quantity": number >= 1 }`
- `DELETE /cart/items/{itemId}` – remove a single item.
- `DELETE /cart` – clear entire cart for the current user.

### 5. Favorites

Per-user favorites, backed by the `Favorites` DynamoDB table. All routes require JWT.

- `GET /favorites` – list user's favorite products (includes product data).
- `POST /favorites` – add a product to favorites.
  - Body:
    ```json
    {
      "productId": "<product-uuid>"
    }
    ```
- `DELETE /favorites/{productId}` – remove a product from favorites.

---

## Development Notes

- DynamoDB DocumentClient is exposed on `server.app.dynamodb` via `dynamoDbPlugin` (`src/plugins/dynamoDbPlugin.ts`).
- JWT authentication is configured in `src/plugins/jwtPlugin.ts` and set as the default auth strategy.
- Swagger is configured in `src/plugins/swaggerPlugin.ts` with global JWT security.
- All IDs are UUIDs generated using the `uuid` package.
- Related data (e.g., products in cart) is fetched using `BatchGetCommand` for efficiency.

---

## Useful Scripts

Defined in `package.json`:

- `npm run dev` – start dev server with nodemon + ts-node.
- `npm run build` – compile TypeScript (`tsc`).
- `npm start` – run the compiled JS.
- `npm run setup:dynamodb` – create DynamoDB tables.
- run dynamo locally - java "-Djava.library.path=./DynamoDBLocal_lib" -jar DynamoDBLocal.jar -sharedDb

---

## Documentation

- [DYNAMODB_MIGRATION.md](DYNAMODB_MIGRATION.md) - Complete migration guide and DynamoDB setup
- [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md) - Summary of changes made during migration
- [.env.example](.env.example) - Example environment configuration

---

## Troubleshooting

- **401 Missing authentication**:
  - Ensure you used `/login` and set `Authorization: Bearer <token>` in Swagger's Authorize dialog.
- **400 Invalid request payload input**:
  - Check the Swagger schema for the endpoint; Joi validation failed.
- **DynamoDB connection issues**:
  - Verify AWS credentials in `.env`
  - Check AWS region is correct
  - Ensure tables exist (`npm run setup:dynamodb`)
  - For local development, verify DynamoDB Local is running
- **ResourceNotFoundException**:
  - Tables may not exist. Run `npm run setup:dynamodb`
  - Check table names match environment variables

---

## Migration from Previous Database Stack

This project was originally built with a different SQL database and ORM. It has been fully migrated to AWS DynamoDB. Key changes:

- ✅ Replaced Prisma Client with AWS SDK v3
- ✅ Converted relational schema to DynamoDB tables with GSIs
- ✅ Updated all service and route handlers
- ✅ Maintained API compatibility (endpoints unchanged)
- ✅ Added setup script for table creation

For detailed migration information, see [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md).
