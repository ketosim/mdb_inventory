// src/scripts/validateConversions.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432')
});

async function validateConversions() {
    const client = await pool.connect();
    
    try {
        // 1. Check for missing units
        const missingUnitsResult = await client.query(`
            SELECT p.code, p.description
            FROM products p
            LEFT JOIN product_units pu ON p.code = pu.product_code
            WHERE pu.product_code IS NULL
        `);

        if (missingUnitsResult.rows.length > 0) {
            console.log('\nProducts missing unit conversions:');
            console.table(missingUnitsResult.rows);
        }

        // 2. Validate conversion factors
        const conversionResult = await client.query(`
            SELECT 
                p.code,
                p.description,
                p.pack_size,
                u1.name as walk_unit,
                u2.name as order_unit,
                pu.conversion_factor,
                CASE 
                    WHEN u1.name = u2.name AND pu.conversion_factor != 1.0 THEN 'Same units should have factor 1.0'
                    WHEN u1.name != u2.name AND ABS(pu.conversion_factor - (1.0/p.pack_size)) > 0.0001 THEN 'Invalid conversion factor'
                    ELSE 'OK'
                END as validation_status
            FROM products p
            JOIN product_units pu ON p.code = pu.product_code
            JOIN units u1 ON pu.walk_unit_id = u1.id
            JOIN units u2 ON pu.order_unit_id = u2.id
            WHERE 
                (u1.name = u2.name AND pu.conversion_factor != 1.0) OR
                (u1.name != u2.name AND ABS(pu.conversion_factor - (1.0/p.pack_size)) > 0.0001)
        `);

        if (conversionResult.rows.length > 0) {
            console.log('\nInvalid conversion factors:');
            console.table(conversionResult.rows);
        }

        // 3. Check for unusual pack sizes
        const unusualPackSizesResult = await client.query(`
            SELECT 
                p.code,
                p.description,
                p.pack_size,
                u1.name as walk_unit,
                u2.name as order_unit
            FROM products p
            JOIN product_units pu ON p.code = pu.product_code
            JOIN units u1 ON pu.walk_unit_id = u1.id
            JOIN units u2 ON pu.order_unit_id = u2.id
            WHERE 
                (p.pack_size <= 0) OR
                (p.pack_size > 1000) OR
                (u1.name = u2.name AND p.pack_size != 1)
        `);

        if (unusualPackSizesResult.rows.length > 0) {
            console.log('\nUnusual pack sizes:');
            console.table(unusualPackSizesResult.rows);
        }

        // 4. Summary statistics
        const statsResult = await client.query(`
            SELECT 
                COUNT(*) as total_products,
                COUNT(DISTINCT pu.walk_unit_id) as unique_walk_units,
                COUNT(DISTINCT pu.order_unit_id) as unique_order_units,
                COUNT(*) FILTER (WHERE u1.name = u2.name) as same_unit_count,
                COUNT(*) FILTER (WHERE u1.name != u2.name) as different_unit_count
            FROM products p
            JOIN product_units pu ON p.code = pu.product_code
            JOIN units u1 ON pu.walk_unit_id = u1.id
            JOIN units u2 ON pu.order_unit_id = u2.id
        `);

        console.log('\nSummary Statistics:');
        console.table(statsResult.rows[0]);

    } catch (error) {
        console.error('Validation failed:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run the validation
validateConversions().finally(() => pool.end());