import { NextFunction, Request, Response } from "express";
import status from "http-status";
import AppError from "../errorHelpers/AppError.js";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { jwtUtils } from "../utils/jwt.js";

export const checkAuth = (...roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Frontend sends Bearer token in Authorization header (localStorage-based auth)
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError(status.UNAUTHORIZED, "No token provided. Please log in.");
      }

      const token = authHeader.split(" ")[1];
      const verified = jwtUtils.verifyToken(token, env.ACCESS_TOKEN_SECRET);
      if (!verified.success) throw new AppError(status.UNAUTHORIZED, "Invalid or expired token");

      const { userId, role, email } = verified.data!;

      // Verify user still active in DB
      const user = await prisma.user.findUnique({ where: { id: userId as string } });
      if (!user || user.isDeleted || user.status === "BLOCKED" || user.status === "DELETED") {
        throw new AppError(status.UNAUTHORIZED, "Account not found or inactive");
      }

      if (roles.length && !roles.includes(user.role)) {
        throw new AppError(status.FORBIDDEN, "You do not have permission to access this resource");
      }

      req.user = { userId: user.id, role: user.role, email: user.email };
      next();
    } catch (e) { next(e); }
  };
