import status from "http-status";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { AIService } from "./ai.service.js";
const matchMentors = catchAsync(async (req, res) => {
    const result = await AIService.matchMentors(req.user?.userId, req.body.goal, req.body.budget);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "AI matches generated", data: result });
});
const chat = catchAsync(async (req, res) => {
    // Accept both { messages: [] } and { message: "" } formats
    const msgs = req.body.messages || [{ role: "user", content: req.body.message || "" }];
    const result = await AIService.chat(req.user?.userId, msgs);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "AI response", data: { reply: result, response: result } });
});
const getRecommendations = catchAsync(async (req, res) => {
    const result = await AIService.getRecommendations(req.user.userId);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Recommendations generated", data: { recommendations: result } });
});
const getPlatformInsights = catchAsync(async (req, res) => {
    const result = await AIService.getPlatformInsights();
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Insights generated", data: result });
});
const generateSessionSummary = catchAsync(async (req, res) => {
    // ✅ Fix: Handle both string and string[] for bookingId
    const bookingId = Array.isArray(req.params.bookingId)
        ? req.params.bookingId[0]
        : req.params.bookingId;
    const result = await AIService.generateSessionSummary(bookingId);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Summary generated", data: result });
});
const analyzeSentiment = catchAsync(async (req, res) => {
    const result = await AIService.analyzeSentiment(req.body.text);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Sentiment analyzed", data: result });
});
export const AIController = {
    matchMentors,
    chat,
    getRecommendations,
    getPlatformInsights,
    generateSessionSummary,
    analyzeSentiment
};
