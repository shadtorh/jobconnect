import express from "express";
import {
	createJob,
	updateJob,
	deleteJob,
	getJobsByRecruiter,
	getActiveJobs,
	getJobById,
	getActiveJobsCount,
	getJobApplicantsCount,
	getAppliedJobCount,
} from "../controllers/jobController.js";
import { authenticateUser, recruiterOnly } from "../middleware/authenticate.js";

const router = express.Router();

// router.get("/", getAllJobs); // Anyone can view all jobs
router.get("/active", getActiveJobs); // Only recruiters can view active jobs

// Get all jobs posted by the current recruiter
router.get("/my-jobs", authenticateUser, recruiterOnly, getJobsByRecruiter);

router.get(
	"/active-counts",
	authenticateUser,
	recruiterOnly,
	getActiveJobsCount
); // Only recruiters can view active jobs
// getAppliedJobCount
router.get("/applied-count", authenticateUser, getAppliedJobCount);

router.get("/:id", getJobById); // Anyone can view job details

// Protected routes - require authentication and recruiter role
router.post("/", authenticateUser, recruiterOnly, createJob); // Only recruiters can create jobs
router.put("/:id", authenticateUser, recruiterOnly, updateJob); // Only recruiters can update jobs
router.delete("/:id", authenticateUser, recruiterOnly, deleteJob); // Only recruiters can delete jobs

// getJobApplicants
router.get(
	"/:id/applicants-count",
	authenticateUser,
	recruiterOnly,
	getJobApplicantsCount
); // Only recruiters can view applicants for their jobs

export default router;
