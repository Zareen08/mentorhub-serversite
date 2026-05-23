import status from "http-status";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { ReviewService } from "./review.service.js";
const createReview = catchAsync(async (req, res) => {
    const result = await ReviewService.createReview(req.user.userId, req.body);
    sendResponse(res, { httpStatusCode: status.CREATED, success: true, message: "Review submitted", data: result });
});
const getMentorReviews = catchAsync(async (req, res) => {
    const mentorId = Array.isArray(req.params.mentorId) ? req.params.mentorId[0] : req.params.mentorId;
    const result = await ReviewService.getMentorReviews(mentorId, req.query);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Reviews fetched", data: result.data, meta: result.meta });
});
const getAll = catchAsync(async (req, res) => {
    const result = await ReviewService.getAllReviews(req.query);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "All reviews fetched", data: result.data, meta: result.meta });
});
const getMyReviews = catchAsync(async (req, res) => {
    const result = await ReviewService.getMyReviews(req.user.userId);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "My reviews fetched", data: result });
});
export const ReviewController = {
    createReview,
    getMentorReviews,
    getAll,
    getMyReviews
};
