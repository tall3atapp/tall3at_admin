import { API_CONFIG } from "../src/constants/config.js";

const NODE_ENV = 'development'

if (NODE_ENV) {

    if (API_CONFIG.BASE_URL !== "http://localhost:5030") {
        console.error("❌ Production mode detected! BASE_URL must point to localhost:5030");
        process.exit(1);
    } else {
        console.log("✅ BASE_URL is correct for local development:", API_CONFIG.BASE_URL);
    }
}