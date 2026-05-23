import { toNodeHandler } from "better-auth/node";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import { auth } from "./app/lib/auth.js";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler.js";
import { notFound } from "./app/middleware/notFound.js";
import { IndexRoutes } from "./app/routes/index.js";
import { env } from "./app/config/env.js";

const app: Application = express();

const allowedOrigins = [env.FRONTEND_URL, "http://localhost:3000", "http://localhost:3001"];

app.use(cors({ origin: allowedOrigins, credentials: true, methods: ["GET","POST","PUT","DELETE","PATCH","OPTIONS"] }));

// Better-auth handles its own auth routes
app.use("/api/auth", toNodeHandler(auth));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (_req: Request, res: Response) => res.json({ success: true, message: "MentorHub API running", env: env.NODE_ENV }));

app.use("/api/v1", IndexRoutes);

app.use(globalErrorHandler);
app.use(notFound);

export default app;
