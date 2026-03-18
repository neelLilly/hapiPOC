export interface User {
    id: string;
    email: string;
    password: string;
    createdAt: string;
}

export interface Product {
    id: string;
    entityType: "PRODUCT";
    name: string;
    description?: string;
    price: number;
    stock: number;
    createdAt: string;
}

export interface Cart {
    userId: string;
    updatedAt: string;
}

export interface CartItem {
    cartId: string;
    productId: string;
    quantity: number;
}

export interface Favorite {
    userId: string;
    productId: string;
}
