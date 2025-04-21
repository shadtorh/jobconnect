import dotenv from "dotenv";
import client from "../db/init.js";
// import { addFieldIfProvided } from "../helper/index.js";

dotenv.config();

/**
 * Create a new job
 */
export const createJob = async (req, res) => {
	try {
		const {
			title,
			company_name,
			location,
			category,
			job_type,
			experience_level,
			salary_min,
			salary_max,
			description,
			status,
			posted_date,
			expiry_date,
			responsibilities,
			required_skills,
		} = req.body;

		// Validate required fields
		if (
			!title ||
			!company_name ||
			!location ||
			!category ||
			!job_type ||
			!experience_level ||
			!description ||
			!posted_date ||
			!expiry_date
		) {
			return res.status(400).json({
				success: false,
				message: "Please provide all required fields",
			});
		}

		// Set recruiter_id from authenticated user
		const recruiter_id = req.user.userId;

		// Default status to 'active' if not provided
		const jobStatus = status || "active";

		// Insert job into database
		const result = await client.query(
			`INSERT INTO jobs (
        recruiter_id, title, company_name, location, category,
        job_type, experience_level, salary_min, salary_max, description,
        status, posted_date, expiry_date, responsibilities, required_skills
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
			[
				recruiter_id,
				title,
				company_name,
				location,
				category,
				job_type,
				experience_level,
				salary_min || 0,
				salary_max || 0,
				description,
				jobStatus,
				posted_date,
				expiry_date,
				responsibilities,
				required_skills,
			]
		);

		console.log("Job created successfully:", result.rows[0]);

		res.status(201).json({
			success: true,
			message: "Job created successfully",

			job: result.rows[0],
		});
	} catch (error) {
		console.error("Error creating job:", error);
		res.status(500).json({
			success: false,
			message: "Failed to create job",
			error: error.message,
		});
	}
};

/**
 * Update an existing job
 */
export const updateJob = async (req, res) => {
	console.log("sending body data", req.body); // This should show the job data being sent in the request body
	try {
		const { id } = req.params;

		// Check if body exists
		if (!req.body || Object.keys(req.body).length === 0) {
			return res.status(400).json({
				success: false,
				message: "Request body is empty or invalid",
			});
		}

		console.log("Received body:", req.body);

		// Check if job exists
		const jobCheck = await client.query("SELECT * FROM jobs WHERE id = $1", [
			id,
		]);

		if (jobCheck.rowCount === 0) {
			return res.status(404).json({
				success: false,
				message: "Job not found",
			});
		}

		// Authorization check
		if (jobCheck.rows[0].recruiter_id !== req.user.userId) {
			return res.status(403).json({
				success: false,
				message: "You are not authorized to update this job",
			});
		}

		// Destructure all fields to update
		const {
			title,
			company_name,
			location,
			category,
			job_type,
			experience_level,
			salary_min,
			salary_max,
			description,
			status,
			posted_date,
			expiry_date,
			responsibilities,
			required_skills,
		} = req.body;

		// Validate status if present
		if (status && !["active", "close", "draft"].includes(status)) {
			return res.status(400).json({
				success: false,
				message: "Invalid status. Must be 'active', 'close', or 'draft'",
			});
		}

		let updateFields = [];
		let queryParams = [];
		let paramIndex = 1;

		const addFieldIfProvided = (fieldName, value) => {
			if (value !== undefined) {
				updateFields.push(`${fieldName} = $${paramIndex}`);
				queryParams.push(value);
				paramIndex++;
			}
		};

		// Build update dynamically
		addFieldIfProvided("title", title);
		addFieldIfProvided("company_name", company_name);
		addFieldIfProvided("location", location);
		addFieldIfProvided("category", category);
		addFieldIfProvided("job_type", job_type);
		addFieldIfProvided("experience_level", experience_level);
		addFieldIfProvided("salary_min", salary_min);
		addFieldIfProvided("salary_max", salary_max);
		addFieldIfProvided("description", description);
		addFieldIfProvided("status", status);
		addFieldIfProvided("posted_date", posted_date);
		addFieldIfProvided("expiry_date", expiry_date);
		addFieldIfProvided("responsibilities", responsibilities);
		addFieldIfProvided("required_skills", required_skills);

		if (updateFields.length === 0) {
			return res.status(400).json({
				success: false,
				message: "No valid fields provided for update",
			});
		}

		queryParams.push(id); // Final param for WHERE clause

		const result = await client.query(
			`UPDATE jobs
			 SET ${updateFields.join(", ")}
			 WHERE id = $${paramIndex}
			 RETURNING *`,
			queryParams
		);

		return res.status(200).json({
			success: true,
			message: "Job updated successfully",
			job: result.rows[0],
		});
	} catch (error) {
		console.error("Error updating job:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to update job",
			error: error.message,
		});
	}
};

// get active job

export const getActiveJobs = async (req, res) => {
	try {
		const result = await client.query(
			"SELECT * FROM jobs WHERE status = 'active'"
		);

		return res.status(200).json({
			success: true,
			message: "Active jobs fetched successfully",
			jobs: result.rows,
		});
	} catch (error) {
		console.error("Error fetching active jobs:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to fetch active jobs",
			error: error.message,
		});
	}
};

// get getActiveJobsCount by recruiter only

export const getActiveJobsCount = async (req, res) => {
	try {
		const recruiter_id = req.user.userId;
		const { rows } = await client.query(
			"SELECT COUNT(*) FROM jobs WHERE recruiter_id = $1 AND status = 'active'",
			[recruiter_id]
		);

		return res.status(200).json({ count: parseInt(rows[0].count, 10) });
	} catch (error) {
		console.error("Error fetching active jobs count:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to fetch active jobs count",
			error: error.message,
		});
	}
};

/**
 * Update job status only
 */
// export const updateJobStatus = async (req, res) => {
// 	try {
// 		const { id } = req.params;
// 		const { status } = req.body;

// 		// Validate status
// 		if (!status || !["active", "close", "draft"].includes(status)) {
// 			return res.status(400).json({
// 				success: false,
// 				message: "Invalid status value",
// 			});
// 		}

// 		// Check if job exists
// 		const jobCheck = await client.query("SELECT * FROM jobs WHERE id = $1", [
// 			id,
// 		]);

// 		if (jobCheck.rowCount === 0) {
// 			return res.status(404).json({
// 				success: false,
// 				message: "Job not found",
// 			});
// 		}

// 		// Authorization check
// 		if (jobCheck.rows[0].recruiter_id !== req.user.userId) {
// 			return res.status(403).json({
// 				success: false,
// 				message: "You are not authorized to update this job",
// 			});
// 		}

// 		// Update the status
// 		const result = await client.query(
// 			"UPDATE jobs SET status = $1 WHERE id = $2 RETURNING *",
// 			[status, id]
// 		);

// 		res.status(200).json({
// 			success: true,
// 			message: `Job status updated to ${status}`,
// 			job: result.rows[0],
// 		});
// 	} catch (error) {
// 		console.error("Error updating job status:", error);
// 		res.status(500).json({
// 			success: false,
// 			message: "Failed to update job status",
// 			error: error.message,
// 		});
// 	}
// };

/**
 * Delete a job
 */
export const deleteJob = async (req, res) => {
	try {
		const { id } = req.params;

		// Check if job exists
		const jobCheck = await client.query("SELECT * FROM jobs WHERE id = $1", [
			id,
		]);

		if (jobCheck.rowCount === 0) {
			return res.status(404).json({
				success: false,
				message: "Job not found",
			});
		}

		// Check if user is authorized (recruiter who created the job)
		if (jobCheck.rows[0].recruiter_id !== req.user.userId) {
			return res.status(403).json({
				success: false,
				message: "You are not authorized to delete this job",
			});
		}

		// Delete job from database
		await client.query("DELETE FROM jobs WHERE id = $1", [id]);

		res.status(200).json({
			success: true,
			message: "Job deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting job:", error);
		res.status(500).json({
			success: false,
			message: "Failed to delete job",
			error: error.message,
		});
	}
};

export const getJobsByRecruiter = async (req, res) => {
	try {
		const recruiterId = req.user.userId;
		const jobs = await client.query(
			"SELECT * FROM jobs WHERE recruiter_id = $1",
			[recruiterId]
		);
		res.status(200).json({
			success: true,
			jobs: jobs.rows,
		});
	} catch (error) {
		console.error("Error getting jobs by recruiter:", error);
		res.status(500).json({
			success: false,
			message: "Failed to get jobs by recruiter",
			error: error.message,
		});
	}
};

export const getJobById = async (req, res) => {
	try {
		const { id } = req.params;

		// Check if job exists
		const jobCheck = await client.query("SELECT * FROM jobs WHERE id = $1", [
			id,
		]);

		if (jobCheck.rowCount === 0) {
			return res.status(404).json({
				success: false,
				message: "Job not found",
			});
		}

		res.status(200).json({
			success: true,
			job: jobCheck.rows[0],
		});
	} catch (error) {
		console.error("Error getting job by ID:", error);
		res.status(500).json({
			success: false,
			message: "Failed to get job by ID",
			error: error.message,
		});
	}
};

// getJobApplicants count for each job
export const getJobApplicantsCount = async (req, res) => {
	try {
		const { id } = req.params;

		// Check if job exists
		const jobCheck = await client.query("SELECT * FROM jobs WHERE id = $1", [
			id,
		]);

		if (jobCheck.rowCount === 0) {
			return res.status(404).json({
				success: false,
				message: "Job not found",
			});
		}

		const jobApplicants = await client.query(
			"SELECT COUNT(*) FROM applications WHERE job_id = $1",
			[id]
		);
		const count = parseInt(jobApplicants.rows[0].count, 10);

		res.status(200).json({
			success: true,
			count,
		});
	} catch (error) {
		console.error("Error getting job applicants count:", error);
		res.status(500).json({
			success: false,
			message: "Failed to get job applicants count",
			error: error.message,
		});
	}
};

// getAppliedjobcount for each seeker

export const getAppliedJobCount = async (req, res) => {
	try {
		const seekerId = req.user.userId;

		const result = await client.query(
			"SELECT COUNT(DISTINCT job_id) FROM applications WHERE seeker_id = $1",
			[seekerId]
		);
		const count = parseInt(result.rows[0].count, 10);

		res.status(200).json({
			success: true,
			count,
		});
	} catch (error) {
		console.error("Error getting job applicants count:", error);
		res.status(500).json({
			success: false,
			message: "Failed to get job applicants count",
			error: error.message,
		});
	}
};

// Improved job application submission function

// export const getAllJobs = async (req, res) => {
//     try {
//         const jobs = await client.query("SELECT * FROM jobs");
//         res.status(200).json({
//             success: true,
//             jobs: jobs.rows,
//         });
//     } catch (error) {
//         console.error("Error getting all jobs:", error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to get all jobs",
//             error: error.message,
//         });
//     }
// };
