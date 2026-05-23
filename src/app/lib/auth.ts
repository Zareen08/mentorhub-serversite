import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";
import { env } from "../config/env.js";
import { prisma } from "./prisma.js";
import { sendEmail } from "../utils/email.js";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: env.GOOGLE_CLIENT_ID ? {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }
  } : {},
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      sendVerificationOTP: async ({ email, otp, type }) => {
        const subject = type === "email-verification"
          ? "Verify your MentorHub email"
          : "Reset your MentorHub password";
        const html = `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
          <h2>MentorHub 🎓</h2>
          <p>${type === "email-verification" ? "Your verification code:" : "Your password reset code:"}</p>
          <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#2563eb;padding:16px 0">${otp}</div>
          <p style="color:#6b7280;font-size:14px">Valid for 10 minutes. Do not share this code.</p>
        </div>`;
        if (env.EMAIL_SENDER.SMTP_USER) {
          await sendEmail({ to: email, subject, html });
        } else {
          console.log(`[DEV] OTP for ${email}: ${otp}`);
        }
      },
    }),
    bearer(),
  ],
  session: {
    expiresIn: Number(env.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN) * 24 * 60 * 60,
    updateAge: Number(env.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE) * 24 * 60 * 60,
  },
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "USER" },
      status: { type: "string", required: false, defaultValue: "ACTIVE" },
      needPasswordChange: { type: "boolean", required: false, defaultValue: false },
      isDeleted: { type: "boolean", required: false, defaultValue: false },
    },
  },
});
