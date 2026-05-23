import status from "http-status";
import AppError from "../../errorHelpers/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { auth } from "../../lib/auth.js";
import { env } from "../../config/env.js";
import { jwtUtils } from "../../utils/jwt.js";
import { tokenUtils } from "../../utils/token.js";
import ms, { StringValue } from "ms";

const registerUser = async (payload: { name: string; email: string; password: string }) => {
  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) throw new AppError(status.CONFLICT, "Email already registered");
  const result = await auth.api.signUpEmail({ body: { ...payload, role: "USER", needPasswordChange: false } });
  if (!result.user) throw new AppError(status.BAD_REQUEST, "Registration failed");
  // auto-verify for dev convenience
  await prisma.user.update({ where: { id: result.user.id }, data: { emailVerified: true } });
  await prisma.userProfile.create({ data: { userId: result.user.id } });
  const tokens = tokenUtils.createTokens({ userId: result.user.id, role: "USER", email: payload.email });
  return { user: result.user, ...tokens, token: result.token };
};

const loginUser = async (payload: { email: string; password: string }) => {
  const result = await auth.api.signInEmail({ body: payload }).catch(() => null);
  if (!result) throw new AppError(status.UNAUTHORIZED, "Invalid email or password");
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) throw new AppError(status.NOT_FOUND, "User not found");
  if (user.status === "BLOCKED") throw new AppError(status.FORBIDDEN, "Account is blocked");
  if (user.isDeleted) throw new AppError(status.FORBIDDEN, "Account has been deleted");
  const tokens = tokenUtils.createTokens({ userId: user.id, role: user.role, email: user.email });
  return { user, ...tokens, token: result.token };
};

const getMe = async (reqUser: { userId: string; role: string; email: string }) => {
  const user = await prisma.user.findUnique({
    where: { id: reqUser.userId },
    include: {
      userProfile: true,
      mentor: reqUser.role === "MENTOR" ? true : false,
    },
  });
  if (!user) throw new AppError(status.NOT_FOUND, "User not found");
  return user;
};

const getNewToken = async (refreshToken: string) => {
  const verified = jwtUtils.verifyToken(refreshToken, env.REFRESH_TOKEN_SECRET);
  if (!verified.success) throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
  const user = await prisma.user.findUnique({ where: { id: verified.data!.userId } });
  if (!user) throw new AppError(status.NOT_FOUND, "User not found");
  return tokenUtils.createTokens({ userId: user.id, role: user.role, email: user.email });
};

const logoutUser = async (sessionToken: string) => {
  if (sessionToken) {
    await prisma.session.deleteMany({ where: { token: sessionToken } }).catch(() => {});
  }
};

export const AuthService = { registerUser, loginUser, getMe, getNewToken, logoutUser };
