import Hapi, { type ServerRoute } from '@hapi/hapi'
import { config } from './config/config.ts'
import { routes } from './routes/routes.ts'
import swaggerPlugin from './plugins/swaggerPlugin.ts'
import jwtPlugin from './plugins/jwtPlugin.ts'
import prismaPlugin from './plugins/prismaPlugin.ts'
import authRoutes from './modules/auth/auth.routes.ts'
import productRoutes from './modules/products/product.routes.ts'
import cartRoutes from './modules/cart/cart.routes.ts'
import favoritesRoutes from './modules/favorites/favorites.routes.ts'

async function start() {
    const server = Hapi.server({
        port: config.port,
        host: 'localhost',
    })

    await server.register([
        prismaPlugin,
        swaggerPlugin,
        jwtPlugin,
    ])

    server.route(authRoutes as ServerRoute[]);
    server.route(routes as ServerRoute[]);
    server.route(productRoutes as ServerRoute[]);
    server.route(cartRoutes as ServerRoute[]);
    server.route(favoritesRoutes as ServerRoute[]);

    await server.start();
    console.log(`Server is running on ${server.info.uri}`);
}

start().catch(console.error);
