import jwt from "jsonwebtoken";

export const authRoutes = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            console.log('[Auth Middleware] Token received:', token ? `${token.substring(0, 20)}...` : 'empty');
            console.log('[Auth Middleware] JWT_SECRET_KEY:', process.env.JWT_SECRET_KEY ? 'IS SET' : 'MISSING!!!');
            
            if (!process.env.JWT_SECRET_KEY) {
                console.error('[Auth Middleware] CRITICAL: JWT_SECRET_KEY is not defined!');
                return res.status(500).json({
                    status: "failed",
                    message: "Server configuration error: JWT_SECRET_KEY not set"
                });
            }
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            console.log('[Auth Middleware] Token decoded successfully:', decoded);
            req.user = decoded;
            next();
        } catch (err) {
            console.error('[Auth Middleware] Token verification failed:', err.name, err.message);
            console.error('[Auth Middleware] Error details:', err);
            res.status(401).json({
                status: "failed",
                message: "Invalid token",
                error: err.name + ": " + err.message
            });
        }
    } else {
        console.log('[Auth Middleware] No Authorization header found');
        res.status(401).json({
            status: "failed",
            message: "No token provided"
        });
    }
};

export const adminOnly = (req, res, next) => {
    console.log('[AdminOnly Middleware] Checking admin access for user:', req.user);
    
    if (!req.user) {
        console.log('[AdminOnly Middleware] No user in request - not authenticated');
        return res.status(401).json({ status: 'failed', message: 'Unauthorized - no user in request' });
    }
    
    console.log('[AdminOnly Middleware] User role:', req.user.role, '| Expected: admin');
    
    if (req.user.role !== 'admin') {
        console.log('[AdminOnly Middleware] Access denied - user is not admin');
        return res.status(403).json({ status: 'failed', message: 'Admin access required - current role: ' + req.user.role });
    }
    
    console.log('[AdminOnly Middleware] Admin access granted');
    next();
};