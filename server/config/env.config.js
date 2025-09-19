import { config } from "dotenv";

config({ path: "./.env" }); // looks inside /server/.env

export default {
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_EXPIRE: process.env.JWT_EXPIRE,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS
}

