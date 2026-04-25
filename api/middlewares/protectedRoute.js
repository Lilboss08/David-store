import {User} from "../schemas/userSchema.js"; 



 const protectedRoute = async (req, res, next) => {
    const user = await user.findone({userEmail: User.email});
    if (!user) {
        return res.status(404).json({
            status: "failed",
            message: "user does not exist",
        });
    }

   await user.protectedRoute("admin");
    next();
}

export default protectedRoute;