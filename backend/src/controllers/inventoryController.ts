import { Request, Response } from 'express';
import pool from '../config/database';

export class InventoryController {
    async startSession(req: Request, res: Response) {
        const { salesLevel } = req.body;
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const result = await client.query(`
                INSERT INTO inventory_counts 
                (count_date, sales_level, scale_factor, counted_by, status)
                VALUES (NOW(), $1, $2, $3, 'in_progress')
                RETURNING session_id
            `, [salesLevel, salesLevel/40000, 'system']);

            await client.query('COMMIT');
            res.json({ sessionId: result.rows[0].session_id });
        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({ error: 'Failed to create session' });
        } finally {
            client.release();
        }
    }

    async getProducts(req: Request, res: Response) {
        try {
            // First, let's check if there are any products at all
            const countCheck = await pool.query(`SELECT COUNT(*) FROM products`);
            console.log('Total products in database:', countCheck.rows[0].count);
            
            // Modified query with LEFT JOINs
            const result = await pool.query(`
                SELECT 
                    p.code,
                    p.description,
                    COALESCE(u1.name, 'unit') as "walkUnit",
                    p.pack_size as "packSize",
                    p.base_weekly_usage as "baseWeeklyUsage"
                FROM products p
                LEFT JOIN product_units pu ON p.code = pu.product_code
                LEFT JOIN units u1 ON pu.walk_unit_id = u1.id
                WHERE p.is_active = true
                ORDER BY p.code
            `);
            
            console.log('Products query executed, row count:', result.rows.length);
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({ error: 'Failed to fetch products', details: (error as Error).message });
        }
    }

    async recordCount(req: Request, res: Response) {
        const { sessionId, productCode, quantity } = req.body;
        console.log('Recording count request:', { sessionId, productCode, quantity });
        const client = await pool.connect();
     
        try {
            await client.query('BEGIN');
     
            // Get session info and product details
            console.log('Fetching session info...');
            const sessionResult = await client.query(`
                SELECT scale_factor FROM inventory_counts WHERE session_id = $1
            `, [sessionId]);
            console.log('Session scale factor:', sessionResult.rows[0]?.scale_factor);
     
            console.log('Fetching product info...');
            const productResult = await client.query(`
                SELECT base_weekly_usage FROM products WHERE code = $1
            `, [productCode]);
            console.log('Product weekly usage:', productResult.rows[0]?.base_weekly_usage);
     
            const scaleFactor = sessionResult.rows[0].scale_factor;
            const weeklyUsage = productResult.rows[0].base_weekly_usage;
            const calculatedOrder = Math.max(0, (weeklyUsage * scaleFactor) - quantity);
     
            console.log('Calculated values:', {
                scaleFactor,
                weeklyUsage,
                quantity,
                calculatedOrder
            });
     
            // Insert or update inventory details
            console.log('Saving to inventory_details...');
            await client.query(`
                INSERT INTO inventory_details 
                (session_id, product_code, instock_walk_unit, calculated_order)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (session_id, product_code) 
                DO UPDATE SET 
                    instock_walk_unit = $3,
                    calculated_order = $4
            `, [sessionId, productCode, quantity, calculatedOrder]);
     
            await client.query('COMMIT');
            console.log('Successfully recorded count');
            res.json({ calculatedOrder });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error recording count:', error);
            res.status(500).json({ error: 'Failed to record count' });
        } finally {
            client.release();
        }
     }

     async getOrderSummary(req: Request, res: Response) {
        const { sessionId } = req.params;
        console.log('Getting order summary for session:', sessionId);
        const client = await pool.connect();
        
        try {
            const result = await client.query(`
                WITH all_products AS (
                    SELECT 
                        p.code as "productCode",
                        p.description,
                        COALESCE(id.instock_walk_unit, 0) as "currentStock",
                        p.base_weekly_usage as "weeklyUsage",
                        COALESCE(id.calculated_order, p.base_weekly_usage) as "orderAmount",
                        u1.name as "walkUnit",
                        u2.name as "orderUnit"
                    FROM products p
                    JOIN product_units pu ON p.code = pu.product_code
                    JOIN units u1 ON pu.walk_unit_id = u1.id
                    JOIN units u2 ON pu.order_unit_id = u2.id
                    LEFT JOIN inventory_details id ON p.code = id.product_code 
                        AND id.session_id = $1
                    WHERE p.is_active = true
                )
                SELECT *
                FROM all_products
                WHERE "orderAmount" > 0
                ORDER BY description
            `, [sessionId]);
            
            console.log(`Found ${result.rows.length} orders in summary`);
            
            // Log each order detail
            result.rows.forEach(order => {
                console.log('\nOrder Details:');
                console.log(`Product: ${order.productCode} - ${order.description}`);
                console.log(`Current Stock: ${order.currentStock} ${order.walkUnit}`);
                console.log(`Weekly Usage: ${order.weeklyUsage} ${order.orderUnit}`);
                console.log(`Order Amount: ${order.orderAmount} ${order.orderUnit}`);
                console.log('------------------------');
            });
     
            // Log any products with significant orders
            const significantOrders = result.rows.filter(order => order.orderAmount > 0);
            console.log('\nSignificant Orders Required:');
            significantOrders.forEach(order => {
                console.log(`${order.description}: ${order.orderAmount} ${order.orderUnit}`);
            });
            
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching order summary:', error);
            res.status(500).json({ error: 'Failed to fetch order summary' });
        } finally {
            client.release();
        }
     }
}