import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import client from "../db/init.js";

dotenv.config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeAndSaveInterview = async (req, res) => {
	// Log the beginning of the request processing
	console.log("🧠 ANALYZE & SAVE (Gemini) - Request received");

	// Extract essential data from the request body
	const { transcript, job_id, application_id, vapi_call_id } = req.body;
	// Get user ID from the authentication middleware
	const seeker_id = req.user.userId;

	// Extract the user's name from the request if available
	const userName = req.user?.first_name || "The candidate";

	// --------- INPUT VALIDATION ---------
	// Check if transcript exists and is valid
	if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
		console.log(
			"❌ ANALYZE & SAVE - Bad Request: Missing or invalid transcript"
		);
		return res
			.status(400)
			.json({ success: false, message: "Missing or invalid transcript data." });
	}

	// Check if job ID exists
	if (!job_id) {
		console.log("❌ ANALYZE & SAVE - Bad Request: Missing job_id");
		return res.status(400).json({ success: false, message: "Missing job ID." });
	}

	try {
		// --------- STEP 1: FETCH JOB CONTEXT ---------
		// Get job details for context in the Gemini prompt
		console.log("   ANALYZE & SAVE - Fetching job details for context...");
		const jobQuery = `SELECT title, description, company_name FROM jobs WHERE id = $1`;
		const jobResult = await client.query(jobQuery, [job_id]);

		// Default values in case job isn't found
		let jobTitle = "the position";
		let jobDescription = "standard duties";
		let companyName = "the company";

		// Use actual job details if available
		if (jobResult.rows.length > 0) {
			jobTitle = jobResult.rows[0].title;
			jobDescription = jobResult.rows[0].description;
			companyName = jobResult.rows[0].company_name;
			console.log(
				`   ANALYZE & SAVE - Job Context: ${jobTitle} at ${companyName}`
			);
		} else {
			console.warn("   ANALYZE & SAVE - Job details not found for ID:", job_id);
		}

		// --------- STEP 2: FORMAT TRANSCRIPT ---------
		// Convert transcript array to readable string format for the AI
		const conversationString = transcript
			.map((msg) => `${msg.speaker}: ${msg.text}`)
			.join("\n");
		console.log(
			"   ANALYZE & SAVE - Formatted conversation length:",
			conversationString.length
		);

		// --------- STEP 3: CREATE GEMINI PROMPT ---------
		const systemPrompt = `You are a CRITICAL interview assessor evaluating this job interview transcript.

		INTERVIEW CONTEXT:
		- Position: ${jobTitle} 
		- Company: ${companyName}
		- Job Description: ${jobDescription}
		- Candidate Name: ${userName}

		INTERVIEW TRANSCRIPT:
		--- START CONVERSATION ---
		${conversationString}
		--- END CONVERSATION ---

		ANALYSIS REQUIREMENTS:
		1. BE CRITICAL and HONEST in your evaluation based ONLY on evidence in the transcript.
		2. DO NOT default to average scores. Be willing to give low ratings (1-3) when performance is poor.
		3. RATE each category from 1-10:
		• 1-3: Below expectations (candidate struggled significantly or provided poor answers)
		• 4-6: Meets basic expectations (candidate was adequate but not impressive)
		• 7-8: Strong performance (candidate demonstrated clear competence)
		• 9-10: Exceptional performance (candidate excelled beyond expectations)
		4. ONLY use a score of 5 if there is genuinely mixed evidence - not as a default.
		5. If the candidate performed poorly in an area, rate it accordingly (1-3).
		6. Include a concise but honest 2-3 sentence summary of the overall interview.
		7. Choose ONE recommendation from: "Highly Recommended", "Recommended", "Consider with Reservations", "Not Recommended" 
		based on the actual performance, not on politeness.
		8. Provide a brief 1-2 sentence explanation for your recommendation that INCLUDES THE CANDIDATE'S NAME (${userName}).

		RESPONSE FORMAT:
		You MUST return a JSON object with EXACTLY this structure and nothing else:
		{
		"feedback": {
			"rating": {
			"technicalSkills": <number 1-10>,
			"communication": <number 1-10>,
			"problemSolving": <number 1-10>,
			"experience": <number 1-10>
			},
			"summary": "<honest assessment in 2-3 sentences>",
			"recommendation": "<one of the four recommendation strings>",
			"recommendationMsg": "<1-2 sentence explanation that includes ${userName}'s name>"
		}
		}

		STRICT RULES:
		- BE HONEST AND CRITICAL - do not inflate scores for politeness
		- Be willing to give low scores (1-3) when performance is poor
		- Return ONLY valid JSON - no code blocks, no markdown formatting
		- Use numeric values (not strings) for all ratings
		- ALWAYS include the candidate's name (${userName}) in the recommendationMsg
		- Do NOT add any text before or after the JSON object
		- Format must match EXACTLY - any deviation will cause technical errors`;

		console.log("   ANALYZE & SAVE - Sending prompt to Gemini...");

		// --------- STEP 4: CALL GEMINI API ---------
		// Initialize the Gemini model with JSON response format
		const model = genAI.getGenerativeModel({
			model: "gemini-1.5-flash-latest",
			generationConfig: {
				temperature: 0.7, // Lower temperature for more consistent outputs
				topP: 0.9,
				responseMimeType: "application/json", // Request JSON format
			},
		});

		// Send the prompt to Gemini
		const result = await model.generateContent(systemPrompt);
		const response = await result.response;
		const llmResponseContent = response.text(); // Get raw text response

		console.log("   ANALYZE & SAVE - Gemini response received.");

		if (!llmResponseContent) {
			throw new Error("Gemini returned an empty response.");
		}

		// --------- STEP 5: PARSE AND VALIDATE JSON ---------
		let feedbackData;
		try {
			// Parse the JSON response from Gemini
			feedbackData = JSON.parse(llmResponseContent);

			// Validate that all required fields exist
			if (
				!feedbackData.feedback?.rating?.technicalSkills ||
				!feedbackData.feedback?.rating?.communication ||
				!feedbackData.feedback?.rating?.problemSolving ||
				!feedbackData.feedback?.rating?.experience ||
				!feedbackData.feedback?.summary ||
				!feedbackData.feedback?.recommendation ||
				!feedbackData.feedback?.recommendationMsg
			) {
				console.warn(
					"   ANALYZE & SAVE - Parsed JSON missing required fields:",
					feedbackData
				);
				throw new Error("Parsed JSON does not contain all required fields");
			}

			// Log successful parsing
			console.log("   ANALYZE & SAVE - Parsed feedback JSON successfully");
		} catch (parseError) {
			// Handle JSON parsing errors or missing fields
			console.error(
				"❌ ANALYZE & SAVE - Failed to parse Gemini JSON response:",
				parseError
			);
			console.error("   Raw Gemini Response:", llmResponseContent);

			// Instead of using fallback values, return an error response
			return res.status(500).json({
				success: false,
				message:
					"Error processing AI response. The interview analysis could not be completed.",
				error: parseError.message,
				rawResponse: llmResponseContent.substring(0, 200) + "...", // Include part of the raw response for debugging
			});
		}

		// Continue only if we have valid feedback data
		// --------- STEP 6: CALCULATE OVERALL SCORE ---------
		// Extract individual scores
		const technicalScore = feedbackData.feedback.rating.technicalSkills;
		const communicationScore = feedbackData.feedback.rating.communication;
		const problemSolvingScore = feedbackData.feedback.rating.problemSolving;
		const experienceScore = feedbackData.feedback.rating.experience;

		// Calculate overall score (average of the four categories)
		const overallScore = parseFloat(
			(
				(technicalScore +
					communicationScore +
					problemSolvingScore +
					experienceScore) /
				4
			).toFixed(1)
		);

		console.log("   ANALYZE & SAVE - Calculated overall score:", overallScore);

		// --------- STEP 7: SAVE TO DATABASE ---------
		console.log(
			"   ANALYZE & SAVE - Saving interview and feedback to PostgreSQL DB..."
		);

		// SQL query to insert the interview data and feedback
		const insertQuery = `
      INSERT INTO demo_interviews
        (user_id, job_id, application_id, transcript, feedback_summary, 
         feedback_recommendation, feedback_recommendation_msg, 
         rating_technical, rating_communication, rating_problem_solving, rating_experience, 
         score, vapi_call_id, completed_at)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING id, completed_at;
    `;

		// Values to insert, with proper handling of optional fields
		const values = [
			seeker_id, // User who did the interview
			job_id, // Job they interviewed for
			application_id || null, // Their application ID (if exists)
			JSON.stringify(transcript), // Complete transcript as JSON
			feedbackData.feedback.summary, // Summary from AI
			feedbackData.feedback.recommendation, // Recommendation status
			feedbackData.feedback.recommendationMsg, // Recommendation message
			technicalScore, // Technical skills rating
			communicationScore, // Communication rating
			problemSolvingScore, // Problem solving rating
			experienceScore, // Experience rating
			overallScore, // Overall calculated score
			vapi_call_id || null, // Vapi call ID for reference
		];

		// Execute the insert query
		const dbResult = await client.query(insertQuery, values);
		const newInterviewId = dbResult.rows[0].id; // Get new interview ID
		console.log(
			"✅ ANALYZE & SAVE - Interview saved successfully with ID:",
			newInterviewId
		);

		// --------- STEP 8: SEND RESPONSE ---------
		// Return success response with feedback data
		res.status(201).json({
			success: true,
			message: "Interview analyzed and saved successfully.",
			interviewId: newInterviewId,
			feedback: {
				...feedbackData.feedback,
				overallScore: overallScore, // Add overall score to response
			},
		});
	} catch (error) {
		// Handle any errors that occurred during processing
		console.error("❌ ANALYZE & SAVE - Error:", error);
		res.status(500).json({
			success: false,
			message:
				error.message || "Server error during interview analysis or saving.",
		});
	}
};

/**
 * Get interview by ID
 */
export const getInterviewById = async (req, res) => {
	try {
		const interviewId = req.params.id;

		if (!interviewId) {
			return res.status(400).json({
				success: false,
				message: "Interview ID is required.",
			});
		}

		// Updated query to JOIN with jobs table to get company name and job title
		const query = `
      SELECT di.id, di.job_id, di.application_id, di.transcript, di.feedback_summary, 
             di.feedback_recommendation, di.feedback_recommendation_msg, 
             di.rating_technical, di.rating_communication, di.rating_problem_solving, 
             di.rating_experience, di.score, di.completed_at,
             j.title as job_title, j.company_name
      FROM demo_interviews di
      LEFT JOIN jobs j ON di.job_id = j.id
      WHERE di.id = $1
    `;

		const result = await client.query(query, [interviewId]);

		if (result.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "Interview not found",
			});
		}

		// Parse the transcript JSON if it exists
		if (
			result.rows[0].transcript &&
			typeof result.rows[0].transcript === "string"
		) {
			try {
				result.rows[0].transcript = JSON.parse(result.rows[0].transcript);
			} catch (e) {
				console.warn("Could not parse transcript JSON:", e);
			}
		}

		return res.status(200).json({
			success: true,
			interview: result.rows[0],
		});
	} catch (error) {
		console.error("Error getting interview by ID:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to get interview",
		});
	}
};

/**
 * Get user's interviews
 */
export const getUserInterviews = async (req, res) => {
	try {
		const seekerId = req.user.userId; // Get user ID from the request

		// i want to get the score, job title, company name, and completed_at date
		const query = `
	  SELECT di.id, di.score, j.title, j.company_name, di.completed_at
	  FROM demo_interviews di
	  JOIN jobs j ON di.job_id = j.id
	  WHERE di.user_id = $1
	`;
		const result = await client.query(query, [seekerId]);
		if (result.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "No interviews found for this user",
			});
		}
		return res.status(200).json({
			success: true,
			interviews: result.rows,
		});
	} catch (error) {
		console.error("Error getting user's interviews:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to get user's interviews",
		});
	}
};

/**
 * Get job details by ID - needed for the interview
 */
export const getJobDetailsForInterview = async (req, res) => {
	try {
		const { jobId } = req.params;

		if (!jobId) {
			return res.status(400).json({
				success: false,
				message: "Job ID is required.",
			});
		}
		// console.log(`Attempting to get job details for jobId: ${jobId}`); // <-- Add log

		const query = `
      SELECT id, title, description, company_name, 
			 location, category, job_type, experience_level, responsibilities, salary_min, salary_max
      FROM jobs
      WHERE id = $1
    `;

		// *** The error is likely happening during this database query ***
		const result = await client.query(query, [jobId]);
		// console.log(`Query result for jobId ${jobId}:`, result.rows); // <-- Add log

		if (result.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "Job not found", // Consistent message
			});
		}

		return res.status(200).json({
			success: true,
			message: "Job details retrieved successfully.", // Added message
			interviewDetails: result.rows[0],
		});
	} catch (error) {
		// *** This block is being executed ***
		console.error("Error getting job details:", error); // <-- CHECK YOUR SERVER LOGS FOR THIS LINE
		return res.status(500).json({
			success: false,
			message: "Failed to get job details", // This message is sent to the frontend
		});
	}
};

// interview cout

export const getInterviewCount = async (req, res) => {
	try {
		const seeker_id = req.user.userId; // Get user ID from the request

		if (!seeker_id) {
			return res.status(400).json({
				success: false,
				message: "User ID is required.",
			});
		}

		const query = `
	  SELECT COUNT(*) AS interview_count
	  FROM demo_interviews
	  WHERE user_id = $1
	`;

		const result = await client.query(query, [seeker_id]);

		if (result.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "No interviews found for this user",
			});
		}

		return res.status(200).json({
			success: true,
			interviewCount: result.rows[0].interview_count,
		});
	} catch (error) {
		console.error("Error getting interview count:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to get interview count",
		});
	}
};
