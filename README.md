# Hapi Cart Service API

Cart + favorites API built with **Hapi**, **AWS DynamoDB**, **TypeScript**, and **Temporal** workflows.

---

## Tech Stack

- Hapi v21, @hapi/jwt, hapi-swagger
- AWS DynamoDB, TypeScript
- Temporal.io for workflow orchestration

---

## Prerequisites

- Node.js 18+
- AWS DynamoDB (local or cloud)
- Temporal Server (optional, for workflow features)

---

## Setup

### 1. Install & Configure

```bash
npm install
```

Create a `.env` file:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
JWT_SECRET=your_secret
PORT=4000
```

### 2. Setup Database

```bash
npm run setup:dynamodb
```

Creates tables: `Users`, `Products`, `Carts`, `CartItems`, `Favorites`

### 3. Start Servers

Terminal 1 (optional, for Temporal):
```bash
npm run temporal
```

Terminal 2:
```bash
npm run dev
```

**API**: http://localhost:4000/documentation

---

## Authentication

1. **Register**: `POST /register` with `{ "email", "password" }`
2. **Login**: `POST /login` → get JWT token
3. **Authorize**: In Swagger UI, click lock icon and paste `Bearer <token>`

---

## API Endpoints

### Health & Auth
- `GET /` - API alive check
- `POST /register` - Register user
- `POST /login` - Login (returns JWT)

### Products (Auth required)
- `GET /products` - List products
- `GET /products/{id}` - Get product
- `POST /products` - Create product (direct)
- `POST /products/temporal` - Create product (via Temporal workflow)
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product

### Cart (Auth required)
- `GET /cart` - Get user's cart
- `POST /cart/items` - Add to cart
- `PUT /cart/items/{itemId}` - Update quantity
- `DELETE /cart/items/{itemId}` - Remove item
- `DELETE /cart` - Clear cart

### Favorites (Auth required)
- `GET /favorites` - List favorites
- `POST /favorites` - Add to favorites
- `DELETE /favorites/{productId}` - Remove from favorites

---

## Temporal Workflows

Two routes for creating products:

- **`POST /products`** - Direct service call (no Temporal required)
- **`POST /products/temporal`** - Via Temporal workflow (requires Temporal server)

The Temporal route provides:
- Execution history and audit trail
- Automatic retries
- Monitoring via Temporal UI (`http://localhost:8233`)

**Workflow structure**:
- `src/temporal/workflows/` - Workflow definitions
- `src/temporal/activities/` - Activity implementations
- `src/temporal/workers/` - Worker processes
- `src/temporal/client.ts` - Client connection

---

## Scripts

```bash
npm run dev          # Start dev server
npm run temporal     # Start Temporal server
npm run build        # Build TypeScript
npm run setup:dynamodb  # Create DynamoDB tables
```
