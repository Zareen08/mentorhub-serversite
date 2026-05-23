import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth.js";
import { NotificationController } from "./notification.controller.js";
const router = Router();
router.get("/", checkAuth(), NotificationController.getAll);
router.patch("/:id/read", checkAuth(), NotificationController.markRead);
router.patch("/read-all", checkAuth(), NotificationController.markAllRead);
export const NotificationRoutes = router;
