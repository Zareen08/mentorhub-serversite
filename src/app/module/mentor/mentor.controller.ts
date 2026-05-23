import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { MentorService } from "./mentor.service.js";

const getAllMentors = catchAsync(async (req, res) => {
  const result = await MentorService.getAllMentors(req.query as any);
  sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Mentors fetched", data: result.data, meta: result.meta });
});

const getMentorById = catchAsync(async (req, res) => {
  // Fix: Ensure id is a string
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  
  const result = await MentorService.getMentorById(id);
  sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Mentor fetched", data: result });
});

const createMentorProfile = catchAsync(async (req, res) => {
  // Fix: Ensure userId exists and is a string
  const userId = req.user?.userId;
  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  const result = await MentorService.createMentorProfile(userId, req.body);
  sendResponse(res, { httpStatusCode: status.CREATED, success: true, message: "Mentor profile created", data: result });
});

const updateMentorProfile = catchAsync(async (req, res) => {
  // Fix: Ensure userId exists and is a string
  const userId = req.user?.userId;
  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  const result = await MentorService.updateMentorProfile(userId, req.body);
  sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Profile updated", data: result });
});

const getMentorDashboard = catchAsync(async (req, res) => {
  // Fix: Ensure userId exists and is a string
  const userId = req.user?.userId;
  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  const result = await MentorService.getMentorDashboard(userId);
  sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Dashboard data fetched", data: result });
});

export const MentorController = { getAllMentors, getMentorById, createMentorProfile, updateMentorProfile, getMentorDashboard };