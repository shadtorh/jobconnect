import express from "express";
import {
	getInterviewById,
	analyzeAndSaveInterview, // Use the new analysis function
	getUserInterviews,
	getJobDetailsForInterview,
	getInterviewCount,
} from "../controllers/demoInterviewController.js";
import { authenticateUser } from "../middleware/authenticate.js";

const router = express.Router();

// Job details for interview setup
router.get("/job/:jobId", authenticateUser, getJobDetailsForInterview);

// --- Save interview results ---
router.post("/analyze", authenticateUser, analyzeAndSaveInterview); // Point this to the new function

// get interview count
router.get("/interview-count", authenticateUser, getInterviewCount); // Add this route to get the interview count
// Get user's interviews
router.get("/", authenticateUser, getUserInterviews); // Note: This GET / might conflict if not handled carefully, but usually okay with different methods
// Get interview by ID
router.get("/:id", authenticateUser, getInterviewById);

export default router;
