import type { PrismaClient } from "@prisma/client";

export const getOrCreateCart = async (prisma: PrismaClient, userId: string) => {
    let cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } }
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: {
                user: { connect: { id: userId } }
            },
            include: { items: { include: { product: true } } }
        });
    }

    return cart;
};

export const addItemToCart = async (prisma: PrismaClient, userId: string, productId: string, quantity: number) => {
    console.log('--------------->TRYING TO ADD ITEM TO CART');
    const cart = await getOrCreateCart(prisma, userId);

    const existingItem = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId }
    });


    if (existingItem) {
    console.log('--------------->',existingItem);
        return prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + quantity }
        });
    }

    console.log('--------------->CREATING NEW ITEM',
        cart.id,
        productId,
        quantity
    );
    return prisma.cartItem.create({
        data: {
            cartId: cart.id,
            productId,
            quantity
        }
    });
};

export const updateCartItemQuantity = (prisma: PrismaClient, itemId: string, quantity: number) => {
    return prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity }
    });
};

export const removeCartItem = (prisma: PrismaClient, itemId: string) => {
    return prisma.cartItem.delete({ where: { id: itemId } });
};

export const clearCart = async (prisma: PrismaClient, userId: string) => {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
        return;
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
};
