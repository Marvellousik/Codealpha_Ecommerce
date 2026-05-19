import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // We are hardcoding this directly to bypass Windows PowerShell caching
    url: "postgresql://neondb_owner:npg_yqk1mBidtX4v@ep-falling-smoke-abfplxs1.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
  },
});