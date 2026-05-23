import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth.js";
import { BookingController } from "./booking.controller.js";
const router = Router();
router.get("/admin", checkAuth("SUPER_ADMIN", "ADMIN"), BookingController.getAll);
router.post("/", checkAuth("USER"), BookingController.create);
router.get("/my-bookings", checkAuth("USER"), BookingController.getUserBookings); // match frontend
router.get("/my", checkAuth("USER"), BookingController.getUserBookings); // alias
router.get("/mentor", checkAuth("MENTOR"), BookingController.getMentorBookings);
router.patch("/:id/cancel", checkAuth(), BookingController.cancelBooking); // match frontend
router.patch("/:id/status", checkAuth(), BookingController.updateStatus);
export const BookingRoutes = router;
