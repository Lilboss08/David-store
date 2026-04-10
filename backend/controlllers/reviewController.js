import Review from "../schemas/reviewSchema.js";

// Get all reviews for a specific product
export const getProductReviews = async (req, res) => {
    try {
        const productId = req.params.productId * 1;
        const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
        return res.json({
            status: 'success',
            count: reviews.length,
            reviews
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 'error', message: 'could not retrieve reviews' });
    }
}

// Get all reviews
export const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        return res.json({
            status: 'success',
            count: reviews.length,
            reviews
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 'error', message: 'could not retrieve reviews' });
    }
}

// Create a new review
export const createReview = async (req, res) => {
    try {
        const { productId, userId, userName, rating, title, comment } = req.body;

        // Validation
        if (!productId || !userId || !userName || !rating || !title || !comment) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide all required fields'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                status: 'fail',
                message: 'Rating must be between 1 and 5'
            });
        }

        const review = await Review.create({
            productId,
            userId,
            userName,
            rating,
            title,
            comment
        });

        return res.status(201).json({
            status: 'success',
            message: 'Review created successfully',
            review
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 'error', message: 'could not create review' });
    }
}

// Update a review
export const updateReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const { rating, title, comment } = req.body;

        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Rating must be between 1 and 5'
            });
        }

        const review = await Review.findByIdAndUpdate(
            reviewId,
            { rating, title, comment },
            { new: true, runValidators: true }
        );

        if (!review) {
            return res.status(404).json({
                status: 'fail',
                message: 'Review not found'
            });
        }

        return res.json({
            status: 'success',
            message: 'Review updated successfully',
            review
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 'error', message: 'could not update review' });
    }
}

// Delete a review
export const deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const review = await Review.findByIdAndDelete(reviewId);

        if (!review) {
            return res.status(404).json({
                status: 'fail',
                message: 'Review not found'
            });
        }

        return res.json({
            status: 'success',
            message: 'Review deleted successfully'
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 'error', message: 'could not delete review' });
    }
}

// Mark review as helpful
export const markHelpful = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const review = await Review.findByIdAndUpdate(
            reviewId,
            { $inc: { helpful: 1 } },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({
                status: 'fail',
                message: 'Review not found'
            });
        }

        return res.json({
            status: 'success',
            message: 'Review marked as helpful',
            review
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 'error', message: 'could not update review' });
    }
}
