import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  email: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'NGN' },
  items: { type: Array, default: [] },
  reference: { type: String, required: true, unique: true },
  paymentType: { type: String, default: 'Unknown' },
  status: { type: String, default: 'pending' },
  stripePaymentIntent: { type: String },
  state: { type: String },
  lga: { type: String },
  deliveryFee: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;