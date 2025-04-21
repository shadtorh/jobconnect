import express from "express";
import {
	generateQuestions,
	saveInterview, // Import the new controller function
	getInterviewById,
	getUserInterviews,
	getJobDetailsForInterview,
} from "../controllers/demoInterviewController.js";
import { authenticateUser } from "../middleware/authenticate.js";

const router = express.Router();

// Add this simple test route at the top of your routes:
router.get("/test", (req, res) => {
	console.log("🎉 Demo interviews test route reached");
	return res.status(200).json({
		success: true,
		message: "Route is working",
	});
});

// Generate questions based on job
router.get("/questions/:jobId", generateQuestions);

// Job details for interview setup
router.get("/job/:jobId", authenticateUser, getJobDetailsForInterview);

// --- Save interview results ---
// POST /api/demo-interviews/
router.post("/", authenticateUser, saveInterview); // Add this line
// --- End Save interview results ---

// Get interview by ID
router.get("/:id", authenticateUser, getInterviewById);

// Get user's interviews
router.get("/", authenticateUser, getUserInterviews); // Note: This GET / might conflict if not handled carefully, but usually okay with different methods

export default router;
