import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, default: '' },
  image: { type: String, default: '' },
  stock: { type: Number, default: 0 },
  rating: {
    rate: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  }
});

const Product = mongoose.model('Product', productSchema);
export default Product;