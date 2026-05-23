import { Response } from "express";
import ms, { StringValue } from "ms";
import { env } from "../config/env.js";
import { jwtUtils } from "./jwt.js";
const isProd = env.NODE_ENV === "production";
const base = { httpOnly: true, secure: isProd, sameSite: isProd ? "none" as const : "lax" as const };
const setAccessTokenCookie = (res: Response, token: string) =>
  res.cookie("accessToken", token, { ...base, maxAge: ms(env.ACCESS_TOKEN_EXPIRES_IN as StringValue) });
const setRefreshTokenCookie = (res: Response, token: string) =>
  res.cookie("refreshToken", token, { ...base, maxAge: ms(env.REFRESH_TOKEN_EXPIRES_IN as StringValue) });
const setBetterAuthSessionCookie = (res: Response, token: string) =>
  res.cookie("better-auth.session_token", token, { ...base, maxAge: 7 * 24 * 60 * 60 * 1000 });
const createTokens = (payload: { userId: string; role: string; email: string }) => ({
  accessToken: jwtUtils.createToken(payload, env.ACCESS_TOKEN_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as StringValue }),
  refreshToken: jwtUtils.createToken(payload, env.REFRESH_TOKEN_SECRET, { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as StringValue }),
});
export const tokenUtils = { setAccessTokenCookie, setRefreshTokenCookie, setBetterAuthSessionCookie, createTokens };
