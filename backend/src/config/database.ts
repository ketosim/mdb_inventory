//backend/src/config/database.ts
import 'dotenv/config';  // Ensures process.env is populated early
import { Pool } from 'pg';

// Ensure DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is missing from environment variables!");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use DATABASE_URL from .env
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false, // Required for Railway
});

export default pool;
