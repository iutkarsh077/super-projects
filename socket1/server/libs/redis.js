import "dotenv/config";
import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL
})

redisClient.on("error", (err) => {
    console.error("Redis Error:", err);
});

redisClient.on("connect", () => {
    console.log("Redis connecting...");
});

redisClient.on("ready", () => {
    console.log("Redis is ready!");
});

export default redisClient;