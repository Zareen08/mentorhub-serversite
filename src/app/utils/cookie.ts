import { Request, Response } from "express";
const isProd = process.env.NODE_ENV === "production";
const cookieOpts = { httpOnly: true, secure: isProd, sameSite: isProd ? "none" as const : "lax" as const };
export const CookieUtils = {
  getCookie: (req: Request, name: string) => req.cookies?.[name],
  clearCookie: (res: Response, name: string) => res.clearCookie(name, { ...cookieOpts, path: "/" }),
};
