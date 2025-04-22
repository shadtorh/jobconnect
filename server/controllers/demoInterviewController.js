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
// export const saveInterview = async (req, res) => {
// 	console.log("💾 SAVE INTERVIEW - Request received"); // Log entry point

// 	try {
// 		const seeker_id = req.user.userId; // From authenticateUser middleware
// 		const { application_id, job_id, transcript } = req.body;

// 		console.log("   Payload:", {
// 			seeker_id,
// 			application_id,
// 			job_id,
// 			transcript_length: transcript?.length,
// 		}); // Log payload

// 		// --- Validation ---
// 		if (!job_id) {
// 			console.log("   ❌ Validation failed: Missing job_id");
// 			return res
// 				.status(400)
// 				.json({ success: false, message: "Missing job_id" });
// 		}
// 		if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
// 			console.log("   ❌ Validation failed: Missing or invalid transcript");
// 			return res
// 				.status(400)
// 				.json({ success: false, message: "Missing or invalid transcript" });
// 		}
// 		// --- End Validation ---

// 		// --- Generate Feedback & Score with Gemini ---
// 		console.log("   🧠 Generating feedback with Gemini...");
// 		const { score, feedback } = await generateFeedbackWithGemini(
// 			job_id,
// 			transcript
// 		);
// 		console.log("   🧠 Gemini feedback generated:", { score });
// 		// --- End Feedback Generation ---

// 		// --- Database Insertion ---
// 		const insertQuery = `
//       INSERT INTO demo_interviews
//         (application_id, job_id, seeker_id, score, feedback, transcript, completed_at)
//       VALUES
//         ($1, $2, $3, $4, $5, $6, NOW())
//       RETURNING id, completed_at;
//     `; // Added RETURNING to get the new ID

// 		const values = [
// 			application_id || null, // Handle optional application_id
// 			job_id,
// 			seeker_id,
// 			score,
// 			feedback,
// 			JSON.stringify(transcript), // Store transcript as JSONB
// 		];

// 		console.log("   💾 Inserting interview data into database...");
// 		const result = await client.query(insertQuery, values);
// 		console.log(
// 			"   💾 Database insertion successful, new ID:",
// 			result.rows[0].id
// 		);
// 		// --- End Database Insertion ---

// 		return res.status(201).json({
// 			// 201 Created status
// 			success: true,
// 			message: "Interview saved successfully with feedback.",
// 			data: {
// 				interviewId: result.rows[0].id,
// 				score: score,
// 				completedAt: result.rows[0].completed_at,
// 				// feedback: feedback // Optionally return feedback if needed immediately
// 			},
// 		});
// 	} catch (error) {
// 		console.error("❌ Error saving interview:", error); // Log the full error
// 		return res.status(500).json({
// 			success: false,
// 			message: `Failed to save interview: ${error.message}`, // Provide more error detail
// 		});
// 	}
// };

export const analyzeAndSaveInterview = async (req, res) => {
	console.log("🧠 ANALYZE & SAVE (Gemini) - Request received");
	const { transcript, job_id, application_id } = req.body;
	const seeker_id = req.user.userId; // From authenticateUser middleware

	// --- Validation ---
	if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
		console.log(
			"❌ ANALYZE & SAVE - Bad Request: Missing or invalid transcript"
		);
		return res
			.status(400)
			.json({ success: false, message: "Missing or invalid transcript data." });
	}
	if (!job_id) {
		console.log("❌ ANALYZE & SAVE - Bad Request: Missing job_id");
		return res.status(400).json({ success: false, message: "Missing job ID." });
	}
	// --- End Validation ---

	try {
		// 1. Get Job Details (needed for context in the prompt)
		console.log("   ANALYZE & SAVE - Fetching job details for context...");
		const jobQuery = `SELECT title, description, company_name FROM jobs WHERE id = $1`;
		const jobResult = await client.query(jobQuery, [job_id]);
		let jobTitle = "the position";
		let jobDescription = "standard duties";
		let companyName = "the company";
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

		// 2. Format Transcript for LLM
		const conversationString = transcript
			.map((msg) => `${msg.speaker}: ${msg.text}`)
			.join("\n");
		console.log(
			"   ANALYZE & SAVE - Formatted conversation length:",
			conversationString.length
		);

		// 3. Construct the Prompt for Gemini (similar to the image's request)
		const systemPrompt = `Analyze the following Interview Conversation between an Agent (interviewer) and You (candidate) for the ${jobTitle} position at ${companyName}.

Job Description Context: ${jobDescription}

Conversation:
--- START CONVERSATION ---
${conversationString}
--- END CONVERSATION ---

Instructions:
1. Evaluate the candidate's performance based *only* on the conversation provided.
2. Provide ratings out of 10 for: technicalSkills, communication, problemSolving, experience. Base ratings *only* on evidence within the conversation. If evidence is lacking for a category, provide a moderate score (e.g., 5) or indicate insufficient data if possible within the JSON structure.
3. Write a concise summary (strictly 3 lines maximum) of the interview interaction.
4. Provide a recommendation string (e.g., "Recommended", "Not Recommended", "Consider with reservations").
5. Provide a brief message (1-2 sentences) explaining the recommendation.
6. Respond ONLY with a valid JSON object matching this exact structure. Do not include any text before or after the JSON object. Ensure all string values are properly quoted.
{
  "feedback": {
    "rating": {
      "technicalSkills": number,
      "communication": number,
      "problemSolving": number,
      "experience": number
    },
    "summary": string,
    "recommendation": string,
    "recommendationMsg": string
  }
}`;

		console.log("   ANALYZE & SAVE - Sending prompt to Gemini...");

		// 4. Call Gemini API
		const model = genAI.getGenerativeModel({
			model: "gemini-1.5-flash-latest", // Or "gemini-1.0-pro" or "gemini-1.5-pro-latest"
			generationConfig: { responseMimeType: "application/json" }, // Request JSON output directly
		});

		const result = await model.generateContent(systemPrompt);
		const response = await result.response;
		const llmResponseContent = response.text(); // Get the raw text response

		console.log("   ANALYZE & SAVE - Gemini response received.");

		if (!llmResponseContent) {
			throw new Error("Gemini returned an empty response.");
		}

		// 5. Parse the JSON response
		let feedbackData;
		try {
			// Gemini (with responseMimeType) should return just the JSON string
			feedbackData = JSON.parse(llmResponseContent);
			// Basic validation
			if (
				!feedbackData.feedback?.rating ||
				!feedbackData.feedback?.summary ||
				!feedbackData.feedback?.recommendation
			) {
				console.warn(
					"   ANALYZE & SAVE - Parsed JSON missing expected fields:",
					feedbackData
				);
				throw new Error(
					"Parsed JSON does not match expected feedback structure."
				);
			}
			console.log("   ANALYZE & SAVE - Parsed feedback JSON:", feedbackData);
		} catch (parseError) {
			console.error(
				"❌ ANALYZE & SAVE - Failed to parse Gemini JSON response:",
				parseError
			);
			console.error("   Raw Gemini Response:", llmResponseContent); // Log the raw response for debugging
			// Attempt a fallback if parsing fails (less reliable)
			console.warn("   ANALYZE & SAVE - Attempting fallback feedback.");
			feedbackData = {
				feedback: {
					rating: {
						technicalSkills: 5,
						communication: 5,
						problemSolving: 5,
						experience: 5,
					},
					summary: "AI analysis failed. Review transcript manually.",
					recommendation: "Manual Review Required",
					recommendationMsg: "Could not automatically parse AI feedback.",
				},
			};
			// Optionally, you could try regex here, but it's brittle.
		}

		// 6. Save to Database (PostgreSQL)
		console.log(
			"   ANALYZE & SAVE - Saving interview and feedback to PostgreSQL DB..."
		);
		const insertQuery = `
      INSERT INTO demo_interviews
        (user_id, job_id, application_id, transcript, feedback_summary, feedback_recommendation, feedback_recommendation_msg, rating_technical, rating_communication, rating_problem_solving, rating_experience, completed_at)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING id, completed_at;
    `;

		const values = [
			seeker_id,
			job_id,
			application_id || null,
			JSON.stringify(transcript), // Store transcript as JSONB
			feedbackData.feedback.summary,
			feedbackData.feedback.recommendation,
			feedbackData.feedback.recommendationMsg,
			feedbackData.feedback.rating.technicalSkills,
			feedbackData.feedback.rating.communication,
			feedbackData.feedback.rating.problemSolving,
			feedbackData.feedback.rating.experience,
		];

		const dbResult = await client.query(insertQuery, values);
		const newInterviewId = dbResult.rows[0].id;
		console.log(
			"✅ ANALYZE & SAVE - Interview saved successfully with ID:",
			newInterviewId
		);

		// Optionally update Application status if application_id exists
		// if (application_id) { ... }

		res.status(201).json({
			success: true,
			message: "Interview analyzed and saved successfully.",
			interviewId: newInterviewId,
			feedback: feedbackData.feedback, // Send back the parsed feedback
		});
	} catch (error) {
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
