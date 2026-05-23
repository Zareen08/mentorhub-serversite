import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
const createToken = (payload: JwtPayload, secret: string, opts: SignOptions) =>
  jwt.sign(payload, secret, opts);
const verifyToken = (token: string, secret: string) => {
  try { return { success: true, data: jwt.verify(token, secret) as JwtPayload }; }
  catch (e: any) { return { success: false, message: e.message }; }
};
const decodeToken = (token: string) => jwt.decode(token) as JwtPayload;
export const jwtUtils = { createToken, verifyToken, decodeToken };
