import express from "express";
import { addUser, loginUser, verifyEmail, getAllUser, getSingleUser, updateUser, deleteUser } from "../controlllers/userController.js";
import { authRoutes, adminOnly } from "../middlewares/authMiddleware.js";


const router = express.Router();
router
  .route('/')
  .get(authRoutes, adminOnly, getAllUser)

router.route("/register")
  .get((req, res) => res.status(405).json({ status: 'failed', message: 'GET not allowed for register' }))
  .post(addUser)

router.route("/verify-email/:token")
  .get(verifyEmail)

// login endpoint - allow POST for credentials
router.route('/login')
  .post(loginUser)

router.route('/:id')
  .get(authRoutes, getSingleUser)
  .put(authRoutes, updateUser)
  .delete(authRoutes, deleteUser);

export default router;