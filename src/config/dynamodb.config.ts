export const TableNames = {
    USERS: process.env.DYNAMODB_USERS_TABLE || "Users",
    PRODUCTS: process.env.DYNAMODB_PRODUCTS_TABLE || "Products",
    CARTS: process.env.DYNAMODB_CARTS_TABLE || "Carts",
    CART_ITEMS: process.env.DYNAMODB_CART_ITEMS_TABLE || "CartItems",
    FAVORITES: process.env.DYNAMODB_FAVORITES_TABLE || "Favorites"
} as const;
