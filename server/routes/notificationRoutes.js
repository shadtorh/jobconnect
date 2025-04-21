import express from "express";
import {
	getRecruiterNotifications,
	getSeekerNotifications,
	getUnreadNotificationsCount,
	markAllNotificationsAsRead,
	markNotificationAsRead,
} from "../controllers/notificationController.js";
import { authenticateUser, recruiterOnly } from "../middleware/authenticate.js";

const router = express.Router();
// Get all notifications for the logged-in user
router.get("/", authenticateUser, recruiterOnly, getRecruiterNotifications); // Only recruiters can view notifications

// Mark a notification as read
router.patch(
	"/:id/read",
	authenticateUser,
	recruiterOnly,
	markNotificationAsRead
);

// Mark all notifications as read
router.patch(
	"/read-all",
	authenticateUser,
	recruiterOnly,
	markAllNotificationsAsRead
);

// Get unread notification count
router.get(
	"/unread-count",
	authenticateUser,
	recruiterOnly,
	getUnreadNotificationsCount
);

router.get("/seeker", authenticateUser, getSeekerNotifications); // Only seekers can view notifications

export default router;
