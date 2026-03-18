import "dotenv/config";
import Hapi, { type ServerRoute } from '@hapi/hapi'
import { config } from './config/config.ts'
import { routes } from './routes/routes.ts'
import swaggerPlugin from './plugins/swaggerPlugin.ts'
import jwtPlugin from './plugins/jwtPlugin.ts'
import dynamoDbPlugin from './plugins/dynamoDbPlugin.ts'
import authRoutes from './modules/auth/auth.routes.ts'
import productRoutes from './modules/products/product.routes.ts'
import cartRoutes from './modules/cart/cart.routes.ts'
import favoritesRoutes from './modules/favorites/favorites.routes.ts'
import { initializeTemporalClient } from './temporal/client.ts'
import { createProductWorker } from './temporal/workers/productWorker.ts'

async function start() {
    const server = Hapi.server({
        port: config.port,
        host: config.host,
    })

    await server.register([
        dynamoDbPlugin,
        swaggerPlugin,
        jwtPlugin,
    ])

    // Initialize Temporal workflow support
    try {
        await initializeTemporalClient();
        console.log('Temporal Client initialized');
        
        // Start Temporal worker in background
        const dynamodb = server.app.dynamodb;
        const worker = await createProductWorker(dynamodb);
        worker.run().catch((error) => {
            console.error('Worker failed:', error);
        });
        console.log('Temporal Worker started for product-tasks queue');
    } catch (error) {
        console.warn('Temporal not available, running without workflows:', error);
    }

    server.route(authRoutes as ServerRoute[]);
    server.route(routes as ServerRoute[]);
    server.route(productRoutes as ServerRoute[]);
    server.route(cartRoutes as ServerRoute[]);
    server.route(favoritesRoutes as ServerRoute[]);

    await server.start();
    console.log(`Server is running on ${server.info.uri}`);
}

start().catch(console.error);
