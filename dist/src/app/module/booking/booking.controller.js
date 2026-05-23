import status from "http-status";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { BookingService } from "./booking.service.js";
const create = catchAsync(async (req, res) => {
    const result = await BookingService.createBooking(req.user.userId, req.body);
    sendResponse(res, { httpStatusCode: status.CREATED, success: true, message: "Booking created", data: result });
});
const getUserBookings = catchAsync(async (req, res) => {
    const result = await BookingService.getUserBookings(req.user.userId, req.query);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Bookings fetched", data: result.data, meta: result.meta });
});
const getMentorBookings = catchAsync(async (req, res) => {
    const result = await BookingService.getMentorBookings(req.user.userId, req.query);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Bookings fetched", data: result.data, meta: result.meta });
});
const updateStatus = catchAsync(async (req, res) => {
    // ✅ Fix: Convert params.id to string if it's an array
    const bookingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await BookingService.updateBookingStatus(bookingId, req.user.userId, req.user.role, req.body.status);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Booking updated", data: result });
});
const getAll = catchAsync(async (req, res) => {
    const result = await BookingService.getAllBookings(req.query);
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "All bookings fetched", data: result.data, meta: result.meta });
});
const cancelBooking = catchAsync(async (req, res) => {
    // ✅ Fix: Convert params.id to string if it's an array
    const bookingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await BookingService.updateBookingStatus(bookingId, req.user.userId, req.user.role, "CANCELLED");
    sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Booking cancelled", data: result });
});
export const BookingController = {
    create,
    getUserBookings,
    getMentorBookings,
    updateStatus,
    getAll,
    cancelBooking
};
