import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

config({ path: ".env.local" })

const databaseUrl =
  process.env.DATABASE_DIRECT_URL ??
  process.env.DATABASE_URL?.replace(":6543", ":5432")

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set")
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
})
