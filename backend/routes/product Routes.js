import express from "express"
import { getAllProduct, getSingleProduct, updateProuduct, deleteProuduct, addProduct, searchProducts} from"../controlllers/product Controller.js"
import { authRoutes, adminOnly } from "../middlewares/authMiddleware.js"

const router = express.Router();

router.route('/api/v1/products')
.get(getAllProduct)
.post(authRoutes, adminOnly, addProduct)

router.route('/api/v1/products/search')
.get(searchProducts)

router.route('/api/v1/products/:id')
.get(getSingleProduct)
.patch(authRoutes, adminOnly, updateProuduct)
.delete(authRoutes, adminOnly, deleteProuduct)

export default router;
