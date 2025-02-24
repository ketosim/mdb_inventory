//backend/src/config/database.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use DATABASE_URL from .env
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false, // Required for Railway
});

export default pool;
