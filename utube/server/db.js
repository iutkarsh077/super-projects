import mongoose from "mongoose";
import { loadEnv } from "./config/env.js";

export async function connectDb() {
  const { databaseUrl } = loadEnv();
  mongoose.set("strictQuery", true);
  await mongoose.connect(databaseUrl);
}
