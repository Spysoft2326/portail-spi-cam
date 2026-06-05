import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: "./prisma/schema.prisma",
  migrate: {
    adapter: "sqlite",
  },
  datasource: {
    url: process.env.DATABASE_URL || "file:./dev.db",
  },
});

