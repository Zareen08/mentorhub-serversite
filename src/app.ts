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

// Parse comma-separated ALLOWED_ORIGINS env var
// On Vercel: set ALLOWED_ORIGINS=https://your-frontend.vercel.app
const allowedOrigins = [
  env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:3001",
  "https://frontend-rose-ten-79.vercel.app",
  ...(env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
    : []),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Better-auth handles its own auth routes
app.use("/api/auth", toNodeHandler(auth));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Welcome to MentorHub API",
    version: "1.0.0",
    endpoints: { health: "/health", auth: "/api/auth", api: "/api/v1" },
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "MentorHub API running",
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1", IndexRoutes);

app.use(globalErrorHandler);
app.use(notFound);

export default app;
