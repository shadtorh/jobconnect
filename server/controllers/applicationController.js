import client from "../db/init.js";

export const ApplyJobApplication = async (req, res) => {
	try {
		const {
			email,
			first_name,
			last_name,
			cover_letter,
			motivationquestion,
			uniquequestion,
			position,
		} = req.body;
		const job_id = req.params.id;
		const seeker_id = req.user.userId;

		// Validate required fields
		if (!email || !req.file) {
			return res.status(400).json({
				success: false,
				message: "Email and resume are required fields",
			});
		}

		// First, check if the job exists and get the recruiter information
		const jobCheck = await client.query(
			"SELECT id, recruiter_id, title, company_name FROM jobs WHERE id = $1",
			[job_id]
		);

		if (jobCheck.rowCount === 0) {
			return res.status(404).json({
				success: false,
				message: "Job not found",
			});
		}

		const { recruiter_id, title, company_name } = jobCheck.rows[0];

		// Check if user already applied for this job
		const existingApplication = await client.query(
			"SELECT * FROM applications WHERE job_id = $1 AND seeker_id = $2",
			[job_id, seeker_id]
		);

		if (existingApplication.rowCount > 0) {
			return res.status(400).json({
				success: false,
				message: "You have already applied for this job",
			});
		}

		const resumePath = req.file ? req.file.path : null;

		if (!resumePath) {
			return res.status(400).json({
				success: false,
				message: "Resume is required",
			});
		}

		// Insert the application with a reference to the job and the recruiter
		const result = await client.query(
			`INSERT INTO applications 
       (seeker_id, job_id, email, first_name, last_name, resume, cover_letter, position, motivationquestion, uniquequestion, status, viewed_by_recruiter) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
			[
				seeker_id,
				job_id,
				email,
				first_name,
				last_name,
				resumePath,
				cover_letter || null,
				position,
				motivationquestion || null,
				uniquequestion || null,
				"pending",
				false,
			]
		);

		// Get the applicant's name for the notification
		const applicantInfo = await client.query(
			"SELECT first_name, last_name FROM users WHERE id = $1",
			[seeker_id]
		);

		const applicant_name = applicantInfo.rows[0]
			? `${applicantInfo.rows[0].first_name} ${applicantInfo.rows[0].last_name}`
			: "A job seeker";

		// Create a notification for the recruiter (you'll need to create a notifications table)
		// This is optional depending on whether you have a notifications system
		try {
			await client.query(
				`INSERT INTO notifications 
         (user_id, type, message, is_read, related_id) 
         VALUES ($1, $2, $3, $4, $5)`,
				[
					recruiter_id,
					"application",
					`${applicant_name} applied for your job: ${title}`,
					false,
					result.rows[0].id,
				]
			);
		} catch (notificationError) {
			// If notifications table doesn't exist yet, log but continue
			console.log("Notification not created:", notificationError.message);
		}

		res.status(201).json({
			success: true,
			message: `Your application for ${title} at ${company_name} was submitted successfully`,
			jobApplication: result.rows[0],
		});
	} catch (error) {
		console.error("Error posting job application:", error);
		res.status(500).json({
			success: false,
			message: "Failed to post job application",
			error: error.message,
		});
	}
};

// get total applications count for a recruiter
export const getApplicationsCount = async (req, res) => {
	try {
		const recruiter_id = req.user.userId;

		const { rows } = await client.query(
			`SELECT COUNT(*) FROM applications 
       WHERE job_id IN (SELECT id FROM jobs WHERE recruiter_id = $1)`,
			[recruiter_id]
		);

		res.json({ count: parseInt(rows[0].count, 10) });
	} catch (err) {
		res.status(500).json({ error: "Error fetching application count" });
	}
};

// get all applications for a recruiter
export const getJobApplications = async (req, res) => {
	try {
		const recruiter_id = req.user.userId;

		const { rows } = await client.query(
			`SELECT * FROM applications 
	   WHERE job_id IN (SELECT id FROM jobs WHERE recruiter_id = $1)`,
			[recruiter_id]
		);

		res.json({ jobApplications: rows });
	} catch (err) {
		res.status(500).json({ error: "Error fetching job applications" });
	}
};

export const updateApplicationStatus = async (req, res) => {
	try {
		const applicationId = req.params.id;
		const { status } = req.body;
		const recruiterId = req.user.userId;

		// Validate status
		if (!["pending", "approved", "rejected"].includes(status)) {
			return res.status(400).json({
				success: false,
				message: "Invalid status value",
			});
		}

		// Get application and job details to use in notification
		const checkQuery = `
      SELECT a.id, a.seeker_id, j.title, j.company_name
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = $1 AND j.recruiter_id = $2
    `;

		const checkResult = await client.query(checkQuery, [
			applicationId,
			recruiterId,
		]);

		if (checkResult.rows.length === 0) {
			return res.status(403).json({
				success: false,
				message: "You don't have permission to update this application",
			});
		}

		const application = checkResult.rows[0];

		// Update the application status
		const updateQuery = `
      UPDATE applications
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

		const result = await client.query(updateQuery, [status, applicationId]);

		// Create notification for approved or rejected (not for pending)
		if (status === "approved" || status === "rejected") {
			const notificationMessage =
				status === "approved"
					? `Congratulations! Your application for ${application.title} at ${application.company_name} has been approved!`
					: `Your application for ${application.title} at ${application.company_name} has been rejected.`;

			const notifyQuery = `
        INSERT INTO notifications
        (user_id, message, type, is_read, created_at)
        VALUES ($1, $2, $3, false, NOW())
      `;

			await client.query(notifyQuery, [
				application.seeker_id,
				notificationMessage,
				"application_status",
			]);
		}

		return res.status(200).json({
			success: true,
			message: `Application ${status} successfully`,
			application: result.rows[0],
		});
	} catch (error) {
		console.error("Error updating application status:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to update application status",
			error: error.message,
		});
	}
};

// In applicationController.js
export const getApplicationById = async (req, res) => {
	try {
		const applicationId = req.params.id;
		const recruiterId = req.user.userId;

		// Get application with job info
		const query = `
      SELECT a.*, j.title as job_title, j.company_name 
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = $1 AND j.recruiter_id = $2
    `;

		const result = await client.query(query, [applicationId, recruiterId]);

		if (result.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message:
					"Application not found or you don't have permission to view it",
			});
		}

		return res.status(200).json({
			success: true,
			application: result.rows[0],
		});
	} catch (error) {
		console.error("Error fetching application:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to fetch application",
			error: error.message,
		});
	}
};

export const downloadResume = async (req, res) => {
	try {
		const applicationId = req.params.id;

		// Get the application details including resume path
		const result = await client.query(
			`SELECT a.*, j.recruiter_id 
         FROM applications a
         JOIN jobs j ON a.job_id = j.id
         WHERE a.id = $1`,
			[applicationId]
		);

		if (result.rowCount === 0) {
			return res.status(404).json({
				success: false,
				message: "Application not found",
			});
		}

		const application = result.rows[0];

		// Security check - verify this recruiter owns this job
		if (application.recruiter_id !== req.user.userId) {
			return res.status(403).json({
				success: false,
				message: "You are not authorized to access this resume",
			});
		}

		// Send the resume file
		res.download(application.resume);
	} catch (error) {
		console.error("Error downloading resume:", error);
		res.status(500).json({
			success: false,
			message: "Failed to download resume",
		});
	}
};

export const getSeekerApplications = async (req, res) => {
	try {
		const seeker_id = req.user.userId;

		const result = await client.query(
			`SELECT 
        a.*, 
        j.company_name, 
        j.title, j.job_type
      FROM 
        applications a
      JOIN 
        jobs j ON a.job_id = j.id
      WHERE 
        a.seeker_id = $1
      ORDER BY 
        a.created_at DESC`,
			[seeker_id]
		);

		res.status(200).json({
			success: true,
			seekerApplications: result.rows,
		});
	} catch (error) {
		console.error("Error fetching applications:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch applications",
			error: error.message,
		});
	}
};

// getSeekerApplicationsById

export const getSeekerApplicationsById = async (req, res) => {
	try {
		const seeker_id = req.user.userId;
		const application_id = req.params.id;

		const result = await client.query(
			`SELECT
		a.*, 
		j.company_name, 
		j.title, j.job_type
	  FROM 
		applications a
	  JOIN 
		jobs j ON a.job_id = j.id
	  WHERE 
		a.seeker_id = $1 AND a.id = $2`,
			[seeker_id, application_id]
		);

		res.status(200).json({
			success: true,
			seekerApplications: result.rows[0],
		});
	} catch (error) {
		console.error("Error fetching applications:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch applications",
			error: error.message,
		});
	}
};
