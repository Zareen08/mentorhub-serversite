import status from "http-status";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { MentorService } from "./mentor.service.js";
const getAllMentors = catchAsync(async (req, res) => {
    const result = await MentorService.getAllMentors(req.query);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Mentors fetched", data: result.data, meta: result.meta });
});
const getMentorById = catchAsync(async (req, res) => {
    const result = await MentorService.getMentorById(req.params.id);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Mentor fetched", data: result });
});
const createMentorProfile = catchAsync(async (req, res) => {
    const result = await MentorService.createMentorProfile(req.user.userId, req.body);
    sendResponse(res, { httpStatusCode: status.CREATED, success: true, message: "Mentor profile created", data: result });
});
const updateMentorProfile = catchAsync(async (req, res) => {
    const result = await MentorService.updateMentorProfile(req.user.userId, req.body);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Profile updated", data: result });
});
const getMentorDashboard = catchAsync(async (req, res) => {
    const result = await MentorService.getMentorDashboard(req.user.userId);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Dashboard data fetched", data: result });
});
export const MentorController = { getAllMentors, getMentorById, createMentorProfile, updateMentorProfile, getMentorDashboard };
