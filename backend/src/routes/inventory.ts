import express from 'express';
import { InventoryController } from '../controllers/inventoryController';

const router = express.Router();
const inventoryController = new InventoryController();

router.post('/inventory/session', inventoryController.startSession);
router.get('/products', inventoryController.getProducts);
router.post('/inventory/count', inventoryController.recordCount);
router.get('/inventory/orders/:sessionId', inventoryController.getOrderSummary);

export default router;


