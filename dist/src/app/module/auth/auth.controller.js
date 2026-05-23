import status from "http-status";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { AuthService } from "./auth.service.js";
import { CookieUtils } from "../../utils/cookie.js";
import { tokenUtils } from "../../utils/token.js";
const register = catchAsync(async (req, res) => {
    const result = await AuthService.registerUser(req.body);
    const { accessToken, refreshToken, token, ...rest } = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token);
    sendResponse(res, { httpStatusCode: status.CREATED, success: true, message: "Registration successful", data: { accessToken, refreshToken, token, ...rest } });
});
const login = catchAsync(async (req, res) => {
    const result = await AuthService.loginUser(req.body);
    const { accessToken, refreshToken, token, ...rest } = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Login successful", data: { accessToken, refreshToken, token, ...rest } });
});
const getMe = catchAsync(async (req, res) => {
    const result = await AuthService.getMe(req.user);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Profile fetched", data: result });
});
const refreshToken = catchAsync(async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (!token)
        throw new Error("No refresh token");
    const result = await AuthService.getNewToken(token);
    tokenUtils.setAccessTokenCookie(res, result.accessToken);
    tokenUtils.setRefreshTokenCookie(res, result.refreshToken);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Token refreshed", data: result });
});
const logout = catchAsync(async (req, res) => {
    const sessionToken = req.cookies?.["better-auth.session_token"];
    await AuthService.logoutUser(sessionToken);
    CookieUtils.clearCookie(res, "accessToken");
    CookieUtils.clearCookie(res, "refreshToken");
    CookieUtils.clearCookie(res, "better-auth.session_token");
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Logged out successfully" });
});
export const AuthController = { register, login, getMe, refreshToken, logout };
