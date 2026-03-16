# Hapi Cart Service API

Cart + favorites API built with **Hapi**, **Prisma**, and **PostgreSQL (Neon)**, documented via **hapi-swagger**.

---

## Tech Stack

- Hapi v21 (Node.js HTTP framework)
- @hapi/jwt for authentication
- hapi-swagger for API docs
- Prisma ORM with PostgreSQL (Neon)
- TypeScript

---

## Prerequisites

- Node.js 18+
- An accessible PostgreSQL database (Neon recommended)

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create a `.env` file in the project root (you can copy from `.env.example`) and set:

```env
JWT_SECRET=changeme
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"
```

> Note: For Neon, paste the connection string from the Neon dashboard.

### 3. Prisma

Generate the Prisma client and run the initial migration:

```bash
npx prisma generate
npx prisma migrate dev --name init_cart_service
```

This creates the following models in your database:

- `User`
- `Product`
- `Cart`
- `CartItem`
- `Favorite`

---

## Running the server

```bash
npm run dev
```

The API will start at:

- **Base URL**: `http://localhost:4000`
- **Swagger UI**: `http://localhost:4000/docs`

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
   - Click the **Authorize** (lock) button in `/docs`.
   - For `jwt (apiKey)` value, paste:
     ```text
     Bearer <JWT_TOKEN>
     ```
   - Now all protected endpoints (cart, favorites, product mutations, `/protected`) will use this JWT.

---

## Domains & Endpoints

### 1. Health & Base

- `GET /` – simple “API is Live !!!” response (no auth).
- `GET /health` – health check with optional `name` query (no auth).

### 2. Auth

- `POST /register` – register a new user.
  - Body: `{ "email": string, "password": string (min 8) }`
- `POST /login` – login and receive a JWT.
  - Body: `{ "email": string, "password": string }`
- `GET /protected` – sample protected route (requires JWT).

Users are stored in the `User` table with **bcrypt-hashed passwords**. JWT payload includes `userId` and `email`.

### 3. Products

All product data is stored in the `Product` table.

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

Per-user cart, backed by `Cart` and `CartItem` tables. All routes require JWT.

- `GET /cart` – get the current user’s cart (includes items and products).
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

Per-user favorites, backed by the `Favorite` table. All routes require JWT.

- `GET /favorites` – list user’s favorite products (includes product data).
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

- Prisma client is exposed on `server.app.prisma` via `prismaPlugin` (`src/plugins/prismaPlugin.ts`).
- JWT authentication is configured in `src/plugins/jwtPlugin.ts` and set as the default auth strategy.
- Swagger is configured in `src/plugins/swaggerPlugin.ts` with global JWT security, so once authorized, all protected endpoints in `/docs` send the `Authorization` header automatically.

---

## Useful Scripts

Defined in `package.json`:

- `npm run dev` – start dev server with nodemon + ts-node.
- `npm run build` – compile TypeScript (`tsc`).
- `npm start` – run the compiled JS (`node dist/server.ts`).
- `npm run prisma:migrate` – alias for `prisma migrate dev` (if desired).
- `npx prisma studio` – open Prisma Studio (run manually) to inspect DB.

---

## Troubleshooting

- **401 Missing authentication**:
  - Ensure you used `/login` and set `Authorization: Bearer <token>` in Swagger’s Authorize dialog.
- **400 Invalid request payload input**:
  - Check the Swagger schema for the endpoint; Joi validation failed.
- **Database connection issues**:
  - Verify `DATABASE_URL` in `.env` and run `npx prisma migrate dev` again if schema changed.

