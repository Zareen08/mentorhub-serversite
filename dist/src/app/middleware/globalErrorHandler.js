import status from "http-status";
import AppError from "../errorHelpers/AppError.js";
export const globalErrorHandler = (err, req, res, next) => {
    if (process.env.NODE_ENV === "development")
        console.error("Error:", err);
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    if (err?.name === "ZodError") {
        return res.status(400).json({ success: false, message: err.errors[0]?.message || "Validation error" });
    }
    return res.status(status.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message || "Internal server error" });
};
