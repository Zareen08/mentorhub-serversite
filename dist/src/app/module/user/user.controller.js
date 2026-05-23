import status from "http-status";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { UserService } from "./user.service.js";
const getAll = catchAsync(async (req, res) => {
    const result = await UserService.getAllUsers(req.query);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Users fetched", data: result.data, meta: result.meta });
});
const updateStatus = catchAsync(async (req, res) => {
    const result = await UserService.updateUserStatus(req.params.id, req.body);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "User updated", data: result });
});
const getProfile = catchAsync(async (req, res) => {
    const result = await UserService.getUserProfile(req.user.userId);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Profile fetched", data: result });
});
const updateProfile = catchAsync(async (req, res) => {
    const result = await UserService.updateUserProfile(req.user.userId, req.body);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Profile updated", data: result });
});
const deleteUser = catchAsync(async (req, res) => {
    await UserService.deleteUser(req.params.id);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "User deleted" });
});
export const UserController = { getAll, updateStatus, getProfile, updateProfile, deleteUser };
