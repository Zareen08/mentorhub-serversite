import dotenv from "dotenv";
dotenv.config();

const optional = (key: string, fallback = ""): string =>
  process.env[key] || fallback;

const required = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
};

export const env = {
  NODE_ENV: optional("NODE_ENV", "development"),
  PORT: optional("PORT", "5000"),
  DATABASE_URL: required("DATABASE_URL"),
  BETTER_AUTH_SECRET: required("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: optional("BETTER_AUTH_URL", "http://localhost:5000"),
  ACCESS_TOKEN_SECRET: required("ACCESS_TOKEN_SECRET"),
  REFRESH_TOKEN_SECRET: required("REFRESH_TOKEN_SECRET"),
  ACCESS_TOKEN_EXPIRES_IN: optional("ACCESS_TOKEN_EXPIRES_IN", "1d"),
  REFRESH_TOKEN_EXPIRES_IN: optional("REFRESH_TOKEN_EXPIRES_IN", "30d"),
  BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: optional("BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN", "7"),
  BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: optional("BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE", "1"),
  FRONTEND_URL: optional("FRONTEND_URL", "http://localhost:3000"),
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  CLOUDINARY_CLOUD_NAME: optional("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: optional("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: optional("CLOUDINARY_API_SECRET"),
  ALLOWED_ORIGINS: optional("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001,https://frontend-rose-ten-79.vercel.app"),
  EMAIL_SENDER: {
    SMTP_HOST: optional("SMTP_HOST", "smtp.gmail.com"),
    SMTP_PORT: optional("SMTP_PORT", "587"),
    SMTP_USER: optional("SMTP_USER"),
    SMTP_PASS: optional("SMTP_PASS"),
    SMTP_FROM: optional("SMTP_FROM", "noreply@mentorhub.com"),
  },
  GOOGLE_CLIENT_ID: optional("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: optional("GOOGLE_CLIENT_SECRET"),
  SUPER_ADMIN_EMAIL: optional("SUPER_ADMIN_EMAIL", "admin@mentorhub.com"),
  SUPER_ADMIN_PASSWORD: optional("SUPER_ADMIN_PASSWORD", "Admin123!"),
};
