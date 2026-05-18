import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

function createDb() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set")
  }

  const client = postgres(connectionString, { prepare: false })
  return drizzle(client, { schema })
}

type Db = ReturnType<typeof createDb>

const globalForDb = globalThis as unknown as { db: Db | undefined }

export const db = globalForDb.db ?? createDb()

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db
}

export * from "./schema"
