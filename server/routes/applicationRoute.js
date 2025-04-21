import express from "express";

import { authenticateUser, recruiterOnly } from "../middleware/authenticate.js";

const router = express.Router();
import upload from "../middleware/upload.js";
import {
	ApplyJobApplication,
	downloadResume,
	getApplicationById,
	getApplicationsCount,
	getJobApplications,
	updateApplicationStatus,
	getSeekerApplications,
	getSeekerApplicationsById,
} from "../controllers/applicationController.js";

// Get all applications for a specific job
router.get(
	"/applications-count",
	authenticateUser,
	recruiterOnly,
	getApplicationsCount
);

// Get all applications for a recruiter
router.get(
	"/job-applications",
	authenticateUser,
	recruiterOnly,
	getJobApplications
);

// Get all applications for a job seeker
router.get("/seeker-applications", authenticateUser, getSeekerApplications);

// Apply for job route with file upload middleware
router.post(
	"/:id/apply",
	authenticateUser,
	upload.single("resume"),
	ApplyJobApplication
);

router.patch(
	"/:id/status",
	authenticateUser,
	recruiterOnly,
	updateApplicationStatus
);

router.get("/:id/resume", authenticateUser, recruiterOnly, downloadResume);

// Add this route
router.get("/:id", authenticateUser, recruiterOnly, getApplicationById);

router.get("/seeker/:id", authenticateUser, getSeekerApplicationsById);

export default router;
