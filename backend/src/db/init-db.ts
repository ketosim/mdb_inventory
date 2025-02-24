import { Pool } from 'pg';
import { readFile } from 'fs/promises';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Railway PostgreSQL
    }
});

async function initDatabase() {
    try {
        const schemaPath = join(__dirname, 'schema.sql');
        const schema = await readFile(schemaPath, 'utf-8');

        await pool.query(schema);
        console.log('✅ Database schema created successfully');
    } catch (error) {
        console.error('❌ Failed to initialize database:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run only if executed directly
if (require.main === module) {
    initDatabase();
}

export default pool;
