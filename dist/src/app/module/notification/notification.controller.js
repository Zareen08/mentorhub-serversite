import status from "http-status";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { NotificationService } from "./notification.service.js";
const getAll = catchAsync(async (req, res) => {
    // Fix: Ensure userId exists
    const userId = req.user?.userId;
    if (!userId) {
        throw new Error("User not authenticated");
    }
    const result = await NotificationService.getNotifications(userId);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Notifications fetched", data: result });
});
const markRead = catchAsync(async (req, res) => {
    // Fix: Ensure userId exists
    const userId = req.user?.userId;
    if (!userId) {
        throw new Error("User not authenticated");
    }
    // Fix: Ensure notificationId is a string
    const notificationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await NotificationService.markRead(userId, notificationId);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Marked as read" });
});
const markAllRead = catchAsync(async (req, res) => {
    // Fix: Ensure userId exists
    const userId = req.user?.userId;
    if (!userId) {
        throw new Error("User not authenticated");
    }
    await NotificationService.markAllRead(userId);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "All marked as read" });
});
export const NotificationController = { getAll, markRead, markAllRead };
