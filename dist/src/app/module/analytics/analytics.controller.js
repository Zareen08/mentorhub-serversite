import status from "http-status";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { AnalyticsService } from "./analytics.service.js";
const getPlatformStats = catchAsync(async (req, res) => {
    const result = await AnalyticsService.getPlatformStats();
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Stats fetched", data: result });
});
const getTopMentors = catchAsync(async (req, res) => {
    const result = await AnalyticsService.getTopMentors();
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Top mentors fetched", data: result });
});
const getBookingTrends = catchAsync(async (req, res) => {
    const result = await AnalyticsService.getBookingTrends();
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Trends fetched", data: result });
});
const getMentorAnalytics = catchAsync(async (req, res) => {
    const result = await AnalyticsService.getMentorAnalytics(req.user.userId);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Mentor analytics fetched", data: result });
});
const getAdminDashboard = catchAsync(async (req, res) => {
    const result = await AnalyticsService.getAdminDashboard();
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Dashboard fetched", data: result });
});
export const AnalyticsController = { getPlatformStats, getTopMentors, getBookingTrends, getMentorAnalytics, getAdminDashboard };
