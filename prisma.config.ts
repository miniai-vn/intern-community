import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

dotenv.config(); // 👈 QUAN TRỌNG

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
