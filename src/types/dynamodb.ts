export interface User {
    id: string;
    email: string;
    password: string;
    createdAt: string;
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    createdAt: string;
}

export interface Cart {
    id: string;
    userId: string;
    updatedAt: string;
}

export interface CartItem {
    id: string;
    cartId: string;
    productId: string;
    quantity: number;
}

export interface Favorite {
    id: string;
    userId: string;
    productId: string;
}
