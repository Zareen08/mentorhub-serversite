import nodemailer from "nodemailer";
import { env } from "../config/env.js";
export const sendEmail = async ({ to, subject, html }) => {
    if (!env.EMAIL_SENDER.SMTP_USER) {
        console.log("[DEV] Email skipped (no SMTP config)");
        return;
    }
    const transport = nodemailer.createTransport({
        host: env.EMAIL_SENDER.SMTP_HOST,
        port: Number(env.EMAIL_SENDER.SMTP_PORT),
        auth: { user: env.EMAIL_SENDER.SMTP_USER, pass: env.EMAIL_SENDER.SMTP_PASS },
    });
    await transport.sendMail({ from: env.EMAIL_SENDER.SMTP_FROM, to, subject, html });
};
