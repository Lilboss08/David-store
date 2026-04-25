import Product from "../schemas/productSchema.js";

// making http get request
export const getAllProduct = async (req, res) => {
    try {
        const products = await Product.find();
        return res.json(products);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 'error', message: 'could not retrieve products' });
    }
}

// get a single product api
export const getSingleProduct = async (req, res) =>{
    try {
        const id = req.params.id * 1;
        const singleProduct = await Product.findOne({ id });
        if (singleProduct) {
            return res.status(200).json({ status: 'success', singleProduct });
        } else {
            return res.status(404).json({ status: 'fail', message: 'product not found' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 'error', message: 'server error' });
    }
}
        

// creating a post request api
export const addProduct = async (req, res) => {
    try {
        const last = await Product.findOne().sort({ id: -1 });
        const newId = last ? last.id + 1 : 1;
        const { title, description, price, category, image, rating, stock } = req.body;

        if (!title || !price) {
            return res.status(400).json({ status: 'error', message: 'title and price are required' });
        }

        const newProduct = new Product({
            id: newId,
            title,
            description,
            price,
            category,
            image,
            stock: Number(stock) || 0,
            rating: rating || { rate: 0, count: 0 }
        });

        await newProduct.save();
        res.status(201).json({ status: 'success', newProduct });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'could not add product' });
    }
}

// How to update a product using patch request
export const updateProuduct = async (req, res) =>{
    try {
        const id = req.params.id * 1;
        const updateData = { ...req.body };
        if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);
        const product = await Product.findOneAndUpdate({ id }, updateData, { new: true });
        if (!product) {
            return res.status(404).json({ status: 'fail', message: 'product not found' });
        }
        res.status(200).json({ status: 'success', updatedProduct: product });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'could not update product' });
    }
}


// creating a delete request api
export const deleteProuduct = async (req, res) =>{
    try {
        const id = req.params.id * 1;
        console.log('Deleting product with id:', id, typeof id);
        const result = await Product.findOneAndDelete({ id });
        console.log('Delete result:', result);
        if (!result) {
            return res.status(404).json({ status: 'fail', message: 'product not found' });
        }
        res.status(204).json({ status: 'success' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'could not delete product' });
    }
}

// Search products by title, description, category, or any relevant field
export const searchProducts = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ status: 'error', message: 'Query parameter q is required' });
        }
        
        const products = await Product.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } },
                { brand: { $regex: query, $options: 'i' } },
                { tags: { $regex: query, $options: 'i' } }
            ]
        });
        
        return res.json(products);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 'error', message: 'could not search products' });
    }
}
