// src/scripts/importInventory.ts
import { Pool } from 'pg';
import { parse } from 'papaparse';
import { readFile } from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432')
});

interface InventoryItem {
    code: string;
    codeInt: number;
    category: string;
    description: string;
    packSize: number;
    walkUnit: string;
    orderUnit: string;
    weeklyUsage: number;
}

async function importInventory() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // Read and parse CSV
        const csvContent = await readFile('src/scripts/input.csv', 'utf-8');
        const { data } = parse(csvContent, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true
        });

        for (const item of data as InventoryItem[]) {
            // 1. Insert or update product
            const productResult = await client.query(`
                INSERT INTO products (
                    code, code_int, category, description, 
                    pack_size, base_weekly_usage
                ) VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (code) DO UPDATE SET
                    code_int = $2,
                    category = $3,
                    description = $4,
                    pack_size = $5,
                    base_weekly_usage = $6,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING code
            `, [
                item.code,
                item.codeInt,
                item.category,
                item.description,
                item.packSize,
                item.weeklyUsage
            ]);

            // 2. Get or create walk unit
            const walkUnitResult = await client.query(`
                SELECT id FROM units WHERE name = $1
            `, [item.walkUnit.toLowerCase()]);

            if (walkUnitResult.rows.length === 0) {
                throw new Error(`Walk unit ${item.walkUnit} not found in units table`);
            }

            // 3. Get or create order unit
            const orderUnitResult = await client.query(`
                SELECT id FROM units WHERE name = $1
            `, [item.orderUnit.toLowerCase()]);

            if (orderUnitResult.rows.length === 0) {
                throw new Error(`Order unit ${item.orderUnit} not found in units table`);
            }

            // 4. Calculate conversion factor
            const conversionFactor = item.walkUnit === item.orderUnit ? 
                1.0 : (1.0 / item.packSize);

            // 5. Insert or update product units
            await client.query(`
                INSERT INTO product_units (
                    product_code, walk_unit_id, order_unit_id, 
                    weekly_usage_unit_id, conversion_factor
                ) VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (product_code, walk_unit_id, order_unit_id) 
                DO UPDATE SET
                    conversion_factor = $5
            `, [
                item.code,
                walkUnitResult.rows[0].id,
                orderUnitResult.rows[0].id,
                orderUnitResult.rows[0].id,  // Using order unit for weekly usage
                conversionFactor
            ]);

            console.log(`Imported: ${item.code} - ${item.description}`);
        }

        await client.query('COMMIT');
        console.log('Import completed successfully');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Import failed:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run the import
importInventory().finally(() => pool.end());
