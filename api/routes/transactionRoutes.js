import express from 'express';
import {authRoutes} from '../middlewares/authMiddleware.js';
import { createTransaction, getAllTransactions, handleWebhook } from '../controlllers/transactionController.js';

const router = express.Router();

router.route('/api/v1/transactions')
  .get(authRoutes, getAllTransactions)
  .post(authRoutes, createTransaction);

// webhook endpoint for payment providers
router.post('/api/v1/webhook', handleWebhook);

export default router;