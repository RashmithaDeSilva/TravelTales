import express from 'express';
import dotenv from 'dotenv';
import { setupSwagger } from './src/utils/Swagger.mjs';
import router from './src/routers/Router.mjs';
import { LogTypes } from './src/utils/enums/LogTypes.mjs';
import { log } from './src/utils/ConsoleLog.mjs';


// Setup express app
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3003;
const API_VERSION = process.env.API_VERSION || 'v1';
const ENV = process.env.ENV || 'DEV';

// Swagger setup
if (ENV === "DEV") {
    setupSwagger(app);
}

// Middleware
app.use(express.json());
  
// Routers setup
app.use(`/api/${ API_VERSION }/`, router);

app.listen(PORT, ()=>{
    log(LogTypes.INFO, `Server is running on http://localhost:${ PORT }`);
    if (ENV === "DEV") {
        log(LogTypes.INFO, `Swagger doc available on http://localhost:${ PORT }/api/${ API_VERSION }/api-docs`);
    }
});
