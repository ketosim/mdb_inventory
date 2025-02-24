import express from 'express';
import { InventoryController } from '../controllers/inventoryController';
import pool from '../config/database'; // Make sure this import is added

const router = express.Router();
const inventoryController = new InventoryController();

router.post('/inventory/session', inventoryController.startSession);
router.get('/products', inventoryController.getProducts);
router.post('/inventory/count', inventoryController.recordCount);
router.get('/inventory/orders/:sessionId', inventoryController.getOrderSummary);

// First diagnostic endpoint
router.get('/diagnostics/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products LIMIT 10');
        res.json({
            count: result.rows.length,
            sample: result.rows
        });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Second diagnostic endpoint for database connection
router.get('/diagnostics/db-test', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        res.json({
            connected: true,
            serverTime: result.rows[0].now,
            databaseUrl: process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@') // Hide password
        });
    } catch (error) {
        res.status(500).json({
            connected: false,
            error: (error as Error).message
        });
    }
});

export default router;