import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import client from "../db/init.js";

dotenv.config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate interview questions based on job description
 */
export const generateQuestions = async (req, res) => {
	try {
		const { jobId } = req.params;

		// Get job details
		const jobQuery = `SELECT title, description, company_name FROM jobs WHERE id = $1`;
		const jobResult = await client.query(jobQuery, [jobId]);

		if (jobResult.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "Job not found",
			});
		}

		const job = jobResult.rows[0];

		// Generate questions with Gemini
		const questions = await generateQuestionsWithGemini(job);

		return res.status(200).json({
			success: true,
			questions,
		});
	} catch (error) {
		console.error("Error generating questions:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to generate interview questions",
		});
	}
};

/**
 * Generate questions using Gemini API
 */
async function generateQuestionsWithGemini(jobData) {
	try {
		const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

		const prompt = `
      As an AI interview assistant, generate 5 professional interview questions for a ${jobData.title} position at ${jobData.company_name}.
      
      Job Description: ${jobData.description}
      
      The questions should:
      1. Be relevant to the specific job skills and requirements
      2. Assess both technical skills and soft skills
      3. Include a mix of behavioral and situational questions
      4. Be clear and concise
      
      Format your response as a JSON array of strings containing just the questions.
    `;

		const result = await model.generateContent(prompt);
		const response = await result.response;
		const text = response.text();

		try {
			// Try to parse JSON from response
			return JSON.parse(text);
		} catch (error) {
			console.error("Error parsing questions:", error);
			// Fallback questions
			return [
				`Tell me about your experience related to ${jobData.title}.`,
				"What are your greatest strengths and how do they apply to this role?",
				"Describe a challenging situation you faced and how you resolved it.",
				`Why are you interested in working at ${jobData.company_name}?`,
				"What questions do you have about the position?",
			];
		}
	} catch (error) {
		console.error("Error generating questions with Gemini:", error);
		// Fallback questions
		return [
			`Tell me about your experience related to the position.`,
			"What are your greatest strengths and how do they apply to this role?",
			"Describe a challenging situation you faced and how you resolved it.",
			"Why are you interested in this position?",
			"What questions do you have about the role?",
		];
	}
}

/**
 * Save interview results including transcript, score, and feedback
 */
export const saveInterview = async (req, res) => {
	console.log("💾 SAVE INTERVIEW - Request received"); // Log entry point

	try {
		const seeker_id = req.user.userId; // From authenticateUser middleware
		const { application_id, job_id, transcript } = req.body;

		console.log("   Payload:", {
			seeker_id,
			application_id,
			job_id,
			transcript_length: transcript?.length,
		}); // Log payload

		// --- Validation ---
		if (!job_id) {
			console.log("   ❌ Validation failed: Missing job_id");
			return res
				.status(400)
				.json({ success: false, message: "Missing job_id" });
		}
		if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
			console.log("   ❌ Validation failed: Missing or invalid transcript");
			return res
				.status(400)
				.json({ success: false, message: "Missing or invalid transcript" });
		}
		// --- End Validation ---

		// --- Generate Feedback & Score with Gemini ---
		console.log("   🧠 Generating feedback with Gemini...");
		const { score, feedback } = await generateFeedbackWithGemini(
			job_id,
			transcript
		);
		console.log("   🧠 Gemini feedback generated:", { score });
		// --- End Feedback Generation ---

		// --- Database Insertion ---
		const insertQuery = `
      INSERT INTO demo_interviews 
        (application_id, job_id, seeker_id, score, feedback, transcript, completed_at)
      VALUES 
        ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id, completed_at; 
    `; // Added RETURNING to get the new ID

		const values = [
			application_id || null, // Handle optional application_id
			job_id,
			seeker_id,
			score,
			feedback,
			JSON.stringify(transcript), // Store transcript as JSONB
		];

		console.log("   💾 Inserting interview data into database...");
		const result = await client.query(insertQuery, values);
		console.log(
			"   💾 Database insertion successful, new ID:",
			result.rows[0].id
		);
		// --- End Database Insertion ---

		return res.status(201).json({
			// 201 Created status
			success: true,
			message: "Interview saved successfully with feedback.",
			data: {
				interviewId: result.rows[0].id,
				score: score,
				completedAt: result.rows[0].completed_at,
				// feedback: feedback // Optionally return feedback if needed immediately
			},
		});
	} catch (error) {
		console.error("❌ Error saving interview:", error); // Log the full error
		return res.status(500).json({
			success: false,
			message: `Failed to save interview: ${error.message}`, // Provide more error detail
		});
	}
};

/**
 * Get interview by ID
 */
export const getInterviewById = async (req, res) => {
	try {
		const { id } = req.params;
		const seeker_id = req.user.userId;

		const query = `
      SELECT di.*, j.title as job_title, j.company_name
      FROM demo_interviews di
      JOIN jobs j ON di.job_id = j.id
      WHERE di.id = $1 AND di.seeker_id = $2
    `;

		const result = await client.query(query, [id, seeker_id]);

		if (result.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "Interview not found",
			});
		}

		return res.status(200).json({
			success: true,
			interview: result.rows[0],
		});
	} catch (error) {
		console.error("Error getting interview:", error);
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
		const seeker_id = req.user.userId;

		const query = `
      SELECT di.id, di.application_id, di.job_id, di.score, di.completed_at, 
             j.title as job_title, j.company_name
      FROM demo_interviews di
      JOIN jobs j ON di.job_id = j.id
      WHERE di.seeker_id = $1
      ORDER BY di.completed_at DESC
    `;

		const result = await client.query(query, [seeker_id]);

		return res.status(200).json({
			success: true,
			interviews: result.rows,
		});
	} catch (error) {
		console.error("Error getting user interviews:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to get interviews",
		});
	}
};

/**
 * Generate feedback using Gemini based on transcript
 */
async function generateFeedbackWithGemini(jobId, transcript) {
	try {
		console.log("Starting Gemini feedback generation for transcript...");

		// Get job details
		const jobQuery = `SELECT title, description, company_name FROM jobs WHERE id = $1`;
		const jobResult = await client.query(jobQuery, [jobId]);

		let jobTitle = "the position";
		let jobDescription = "";
		let companyName = "the company";

		if (jobResult.rows.length > 0) {
			jobTitle = jobResult.rows[0].title;
			jobDescription = jobResult.rows[0].description;
			companyName = jobResult.rows[0].company_name;
		}

		const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

		// Clean and format transcript for better analysis
		const cleanTranscript = transcript.filter(
			(entry) =>
				entry.text &&
				entry.text.trim().length > 0 &&
				(entry.speaker === "Agent" || entry.speaker === "You")
		);

		// Extract just the questions and answers from transcript
		const conversationText = cleanTranscript
			.map((entry) => `${entry.speaker}: ${entry.text.trim()}`)
			.join("\n\n");

		console.log(
			`Prepared transcript with ${cleanTranscript.length} entries for Gemini analysis`
		);

		const prompt = `
      You are an expert interviewer and career coach. Analyze this job interview transcript for a ${jobTitle} position at ${companyName}.
      
      Job Description: ${jobDescription}
      
      Interview Transcript:
      ${conversationText}
      
      Evaluate the candidate's responses and provide:
      1. A score from 1-10 (where 10 is excellent)
      2. Detailed feedback (2-3 paragraphs) highlighting:
         - Strengths demonstrated in the interview
         - Areas for improvement
         - Specific advice for future interviews
      
      Format your response as a JSON object with two fields:
      "score": (number between 1-10),
      "feedback": (string with 2-3 paragraphs of feedback)
    `;

		console.log("Sending prompt to Gemini for feedback analysis...");
		const result = await model.generateContent(prompt);
		const response = await result.response;
		const text = response.text();
		console.log(
			"Received raw response from Gemini:",
			text.substring(0, 100) + "..."
		);

		// Parse the JSON response
		try {
			const parsedFeedback = JSON.parse(text);
			console.log(
				"Successfully parsed Gemini feedback with score:",
				parsedFeedback.score
			);
			return {
				score: parseFloat(parsedFeedback.score) || 7.5,
				feedback: parsedFeedback.feedback || "No feedback provided.",
			};
		} catch (error) {
			console.error("Error parsing Gemini feedback JSON:", error);
			console.log("Raw response that couldn't be parsed:", text);

			// Try to extract score using regex if JSON parsing failed
			const scoreMatch = text.match(/score["']?\s*:\s*(\d+(\.\d+)?)/i);
			const score = scoreMatch ? parseFloat(scoreMatch[1]) : 7.5;

			// Extract feedback - anything that's not obviously JSON structure
			let feedback = text.replace(/[\{\}"'score:,\d\.]+/g, "").trim();
			if (!feedback || feedback.length < 20) {
				feedback =
					"Your interview showed some good qualities. For improvement, consider providing more detailed examples and practicing your responses for common interview questions.";
			}

			return {
				score: score,
				feedback: feedback,
			};
		}
	} catch (error) {
		console.error("Error generating feedback with Gemini:", error);
		// Return fallback feedback
		return {
			score: 7.5,
			feedback:
				"Your interview responses demonstrated relevant experience and good communication skills. You articulated your background well and showed enthusiasm for the role.\n\nTo improve, consider providing more specific examples with measurable outcomes. Structure your answers using the STAR method (Situation, Task, Action, Result) and research the company more thoroughly before your next interview.",
		};
	}
}

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
		console.log(`Attempting to get job details for jobId: ${jobId}`); // <-- Add log

		const query = `
      SELECT id, title, description, company_name, 
			 location, category, job_type, experience_level, responsibilities, salary_min, salary_max
      FROM jobs
      WHERE id = $1
    `;

		// *** The error is likely happening during this database query ***
		const result = await client.query(query, [jobId]);
		console.log(`Query result for jobId ${jobId}:`, result.rows); // <-- Add log

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
