import { API_CONFIG } from "../src/constants/config.js";
const NODE_ENV = 'production'
if (NODE_ENV) {
    if (API_CONFIG.BASE_URL !== "https://webapi.tall3at.com") {
        console.log("\n\nBASEURL is wrong for production:", API_CONFIG.BASE_URL)
        console.error("\n❌ BASE_URL must be https://webapi.tall3at.com for production build!\n");
        process.exit(1); // ❌ build fail
    } else {
        console.log("\n✅ BASE_URL is correct for production build", API_CONFIG
            .BASE_URL
        );
    }
}