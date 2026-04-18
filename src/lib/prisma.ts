import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
// Lưu ý: Nếu máy báo lỗi dòng này, hãy thử đổi thành: import pg from "pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Khởi tạo giống hệt trong file seed của bạn
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
        log: ["query"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;