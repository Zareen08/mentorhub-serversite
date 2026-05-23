import ms from "ms";
import { env } from "../config/env.js";
import { jwtUtils } from "./jwt.js";
const isProd = env.NODE_ENV === "production";
const base = { httpOnly: true, secure: isProd, sameSite: isProd ? "none" : "lax" };
const setAccessTokenCookie = (res, token) => res.cookie("accessToken", token, { ...base, maxAge: ms(env.ACCESS_TOKEN_EXPIRES_IN) });
const setRefreshTokenCookie = (res, token) => res.cookie("refreshToken", token, { ...base, maxAge: ms(env.REFRESH_TOKEN_EXPIRES_IN) });
const setBetterAuthSessionCookie = (res, token) => res.cookie("better-auth.session_token", token, { ...base, maxAge: 7 * 24 * 60 * 60 * 1000 });
const createTokens = (payload) => ({
    accessToken: jwtUtils.createToken(payload, env.ACCESS_TOKEN_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN }),
    refreshToken: jwtUtils.createToken(payload, env.REFRESH_TOKEN_SECRET, { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN }),
});
export const tokenUtils = { setAccessTokenCookie, setRefreshTokenCookie, setBetterAuthSessionCookie, createTokens };
