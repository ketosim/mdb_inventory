// src/db/init-db.ts
import { Pool } from 'pg';
import { readFile } from 'fs/promises';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432')
});

async function initDatabase() {
    try {
        const schemaPath = join(__dirname, 'schema.sql');
        const schema = await readFile(schemaPath, 'utf-8');
        
        await pool.query(schema);
        console.log('Database schema created successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

initDatabase();