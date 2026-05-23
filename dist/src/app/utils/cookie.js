const isProd = process.env.NODE_ENV === "production";
const cookieOpts = { httpOnly: true, secure: isProd, sameSite: isProd ? "none" : "lax" };
export const CookieUtils = {
    getCookie: (req, name) => req.cookies?.[name],
    clearCookie: (res, name) => res.clearCookie(name, { ...cookieOpts, path: "/" }),
};
