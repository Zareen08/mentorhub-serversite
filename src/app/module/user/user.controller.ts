import status from "http-status";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { UserService } from "./user.service.js";

const getAll = catchAsync(async (req, res) => {
  const result = await UserService.getAllUsers(req.query as any);
  sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Users fetched", data: result.data, meta: result.meta });
});

const updateStatus = catchAsync(async (req, res) => {
  // Fix: Ensure userId is a string
  const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  
  const result = await UserService.updateUserStatus(userId, req.body);
  sendResponse(res, { httpStatusCode: status.OK, success: true, message: "User updated", data: result });
});

const getProfile = catchAsync(async (req, res) => {
  // Fix: Ensure userId exists
  const userId = req.user?.userId;
  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  const result = await UserService.getUserProfile(userId);
  sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Profile fetched", data: result });
});

const updateProfile = catchAsync(async (req, res) => {
  // Fix: Ensure userId exists
  const userId = req.user?.userId;
  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  const result = await UserService.updateUserProfile(userId, req.body);
  sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Profile updated", data: result });
});

const deleteUser = catchAsync(async (req, res) => {
  // Fix: Ensure userId is a string
  const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  
  await UserService.deleteUser(userId);
  sendResponse(res, { httpStatusCode: status.OK, success: true, message: "User deleted" });
});

export const UserController = { getAll, updateStatus, getProfile, updateProfile, deleteUser };