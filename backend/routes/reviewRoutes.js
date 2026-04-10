import express from "express"
import {
  getProductReviews,
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  markHelpful
} from "../controlllers/reviewController.js"

const router = express.Router();

// Get all reviews
router.route('/api/v1/reviews')
  .get(getAllReviews)
  .post(createReview)

// Get reviews for a specific product
router.route('/api/v1/products/:productId/reviews')
  .get(getProductReviews)

// Update, delete, and mark helpful a review
router.route('/api/v1/reviews/:id')
  .patch(updateReview)
  .delete(deleteReview)

// Mark review as helpful
router.route('/api/v1/reviews/:id/helpful')
  .post(markHelpful)

export default router;
