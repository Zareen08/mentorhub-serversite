import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth.js";
import { ReviewController } from "./review.controller.js";
const router = Router();
router.get("/", checkAuth("ADMIN", "SUPER_ADMIN"), ReviewController.getAll);
router.get("/my-reviews", checkAuth(), ReviewController.getMyReviews);
router.get("/mentor/:mentorId", ReviewController.getMentorReviews);
router.post("/", checkAuth("USER"), ReviewController.createReview);
export const ReviewRoutes = router;
