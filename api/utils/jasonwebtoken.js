import jwt from "jsonwebtoken";

const createToken = (payload)=>{
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn: process.env.JWT_EXPIRE_IN});
};

export default createToken; 