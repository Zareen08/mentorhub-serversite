import status from "http-status";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { NotificationService } from "./notification.service.js";
const getAll = catchAsync(async (req, res) => {
  const result = await NotificationService.getNotifications(req.user!.userId);
  sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Notifications fetched", data: result });
});
const markRead = catchAsync(async (req, res) => {
  await NotificationService.markRead(req.user!.userId, req.params.id);
  sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Marked as read" });
});
const markAllRead = catchAsync(async (req, res) => {
  await NotificationService.markAllRead(req.user!.userId);
  sendResponse(res, { httpStatusCode: status.OK, success: true, message: "All marked as read" });
});
export const NotificationController = { getAll, markRead, markAllRead };
