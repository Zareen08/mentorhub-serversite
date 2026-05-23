import jwt from "jsonwebtoken";
const createToken = (payload, secret, opts) => jwt.sign(payload, secret, opts);
const verifyToken = (token, secret) => {
    try {
        return { success: true, data: jwt.verify(token, secret) };
    }
    catch (e) {
        return { success: false, message: e.message };
    }
};
const decodeToken = (token) => jwt.decode(token);
export const jwtUtils = { createToken, verifyToken, decodeToken };
