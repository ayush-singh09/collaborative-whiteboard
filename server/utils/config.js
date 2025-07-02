import dotenv from "dotenv";
dotenv.config();

export const MONGODB_CONNECTION_URI = process.env.MONGODB_CONNECTION_URI 

export const SERVER_PORT = process.env.PORT