import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

dotenv.config();

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TravelTales API Gateway Documentation',
            version: '1.0.0',
            description: 'API documentation for Express API with Mysql runing on Production mode with Swagger in an ECMAScript Module project.'
        },
        servers: [{ url: `http://localhost:${ process.env.PORT || 3002 }` }],
    },
    apis: ['./src/routers/*.mjs']
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app) {
    app.use(`/api/${ process.env.API_VERSION || 'v1' }/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}