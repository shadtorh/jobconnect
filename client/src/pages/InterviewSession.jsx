import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useInterviewStore } from "../store/useInterviewStore";
import Vapi from "@vapi-ai/web";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { axiosInstance } from "../utils/axios";
import { formatTime } from "../utils/helper";

// Load your Vapi API Key
const apiKey = import.meta.env.VITE_VAPI_API_KEY;

const InterviewSession = () => {
	// Interview state
	const [interviewStarted, setInterviewStarted] = useState(false);
	const [transcriptData, setTranscriptData] = useState([]);
	const [userSpeaking, setUserSpeaking] = useState(false); // User speaking state
	const [agentSpeaking, setAgentSpeaking] = useState(false); //
	// Agent speaking state
	const [timeLeft, setTimeLeft] = useState(600); // 10 minutes countdown
	const timerRef = useRef(null); // Timer ref to clear interval
	const vapiRef = useRef(null); // Ref to hold the Vapi instance

	// Stores and parameters
	const {
		currentJobDetails,
		isLoading,
		error,
		getJobDetailsForInterview,
		clearCurrentJobDetails,
	} = useInterviewStore();
	const { jobId } = useParams();
	const { user } = useAuthStore();
	const fullName = `${user?.first_name} ${user?.last_name}`;

	// Fetch job details on component mount
	useEffect(() => {
		if (jobId) {
			getJobDetailsForInterview(jobId);
		}
		return () => {
			clearCurrentJobDetails();
			stopInterview(); // Make sure we stop any ongoing interview
		};
	}, [jobId, getJobDetailsForInterview, clearCurrentJobDetails]);

	// Initialize Vapi instance once
	useEffect(() => {
		if (!vapiRef.current) {
			vapiRef.current = new Vapi(apiKey);
		}

		// vapiRef.current.on("call-start", () => {
		// 	toast("Call Connected");
		// });
		const handleCallStart = () => {
			toast("Call Connected");
			setAgentSpeaking(false); // Ensure initial state is correct
			setUserSpeaking(false);
		};

		const handleSpeechStart = () => {
			console.log("Assistant speech has started.");
			setAgentSpeaking(true); // AI starts speaking
			setUserSpeaking(false); // User is not speaking
		};

		const handleSpeechEnd = () => {
			console.log("Assistant speech has ended.");
			setAgentSpeaking(false); // AI stops speaking
			// Don't assume user starts speaking here, wait for user transcript message
		};

		// Update handleMessage function to better extract data from conversation-update
		const handleMessage = (message) => {
			console.log("Message received:", message);

			// Store the last received message in a ref for later use
			if (!window._lastVapiMessage) {
				window._lastVapiMessage = [];
			}
			window._lastVapiMessage.push(message);

			// Handle conversation updates - IMPROVED VERSION
			if (
				message.type === "conversation-update" &&
				message.messages &&
				message.messages.length > 0
			) {
				console.log(
					"Processing conversation update with",
					message.messages.length,
					"messages"
				);

				try {
					// Extract messages directly from the messages array
					const formattedMessages = [];

					// Loop through each message and extract data
					for (let i = 0; i < message.messages.length; i++) {
						const msg = message.messages[i];

						// Skip system messages
						if (msg.role === "system") continue;

						const formattedMsg = {
							speaker:
								msg.role === "bot" || msg.role === "assistant"
									? "Agent"
									: "You",
							text: msg.message || msg.content || "",
							time: new Date().toLocaleTimeString(),
							isFinal: true,
						};

						formattedMessages.push(formattedMsg);
						console.log(`Extracted message [${i}]:`, formattedMsg);
					}

					if (formattedMessages.length > 0) {
						console.log(
							`✅ Successfully extracted ${formattedMessages.length} messages`
						);
						setTranscriptData(formattedMessages);
					}
				} catch (err) {
					console.error("Error processing conversation update:", err);
				}
			}
		};

		const handleCallEnd = () => {
			console.log("Call has ended.");
			toast("Call Ended");
			setInterviewStarted(false); // Update state when call ends externally
			setAgentSpeaking(false);
			setUserSpeaking(false);
			setTimeLeft(600); // Reset timer
			GenerateFeedback(); // Call feedback generation function

			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};

		const handleError = (error) => {
			console.error("Vapi Error:", error);
			toast.error(`Vapi Error: ${error?.message || "Unknown error"}`);
			// Optionally stop the interview on error
			stopInterview();
		};

		// Attach listeners
		vapiRef.current.on("call-start", handleCallStart);
		vapiRef.current.on("speech-start", handleSpeechStart);
		vapiRef.current.on("speech-end", handleSpeechEnd);
		vapiRef.current.on("message", handleMessage);
		vapiRef.current.on("call-end", handleCallEnd);
		vapiRef.current.on("error", handleError);

		// Cleanup listeners on component unmount
		return () => {
			if (vapiRef.current) {
				vapiRef.current.off("call-start", handleCallStart);
				vapiRef.current.off("speech-start", handleSpeechStart);
				vapiRef.current.off("speech-end", handleSpeechEnd);
				vapiRef.current.off("message", handleMessage);
				vapiRef.current.off("call-end", handleCallEnd);
				vapiRef.current.off("error", handleError);
			}
		};
	}, []); // Empty dependency array ensures this runs only once

	// Start the interview
	const startInterview = async () => {
		if (!vapiRef.current) {
			console.error("Vapi instance not initialized");
			return;
		}

		if (!currentJobDetails) {
			toast.error("Job details not available");
			return;
		}

		setInterviewStarted(true);
		setTimeLeft(600); // Reset timer
		setTranscriptData([]); // Clear the transcript

		const agentConfig = {
			model: {
				provider: "openai",
				model: "gpt-3.5-turbo",
				messages: [
					{
						role: "system",
						content: `You are Cassandra, a professional interviewer for ${currentJobDetails.company_name}.
							You’re interviewing ${fullName} for the ${currentJobDetails.title} role.
							Job details: ${currentJobDetails.description}
							Ask thoughtful, open-ended questions related to the job description.
							Be prepared to ask follow-up questions to build a strong relationship with the candidate.
							Keep the conversation short and to the point.
							Keep the conversation engaging and interesting.
							Ask open-ended questions to elicit more information from the candidate.
							Be respectful and professional at all times.
							Keep the conversation focused on the interview topic.
							Keep the conversation short and to the point.
							Keep the conversation engaging and interesting.
							Ask follow-up questions to build a strong relationship with the candidate.
							Understand the candidate's skills and experience.
							Respond to the candidate's questions.
							Be polite and professional throughout the interview.
							`,
					},
				],
			},
			voice: {
				provider: "playht",
				voiceId: "jennifer",
			},
			firstMessage: `Hello ${fullName}, I'm Cassandra from ${currentJobDetails.company_name}. Are you ready to begin the interview for the ${currentJobDetails.title} role?`,
		};

		// Start the call using Vapi
		try {
			vapiRef.current.start(agentConfig, (err, data) => {
				if (err) {
					console.error("Failed to start interview:", err);
					toast.error(`Failed to start: ${err.message}`);
					return;
				}
				console.log("Interview started:", data);
				toast("Interview started");
			});
		} catch (error) {
			console.error("Error starting interview:", error);
			toast.error("Interview start error");
		}
	};

	// Stop the interview
	const stopInterview = async () => {
		setInterviewStarted(false);
		setTimeLeft(600); // Reset timer

		if (vapiRef.current) {
			try {
				vapiRef.current.stop((err) => {
					if (err) {
						console.error("Failed to stop interview:", err);

						toast.error("Error stopping call");
						return;
					}
					toast("Interview ended");
					console.log("Interview stopped successfully");
				});
			} catch (error) {
				console.error("Error during stopInterview:", error);
			}
		}
	};

	// Handle countdown timer
	useEffect(() => {
		if (interviewStarted) {
			timerRef.current = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev <= 1) {
						clearInterval(timerRef.current);
						stopInterview();
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		} else {
			clearInterval(timerRef.current); // Clear interval if interview is not started
		}
		return () => clearInterval(timerRef.current); // Clear interval on component unmount
	}, [interviewStarted]); // Timer effect depends on interviewStarted

	// Update GenerateFeedback to access the raw messages directly
	const GenerateFeedback = async () => {
		console.log("🚀 GenerateFeedback called");

		// New approach: access the stored raw messages directly
		let transcriptToSend = [];

		if (transcriptData.length > 0) {
			console.log(
				"Using transcriptData from state:",
				transcriptData.length,
				"messages"
			);
			transcriptToSend = transcriptData;
		} else if (window._lastVapiMessage && window._lastVapiMessage.length > 0) {
			console.log("Attempting to extract from raw stored messages");

			// Get the last conversation-update message
			const lastConvoUpdate = [...window._lastVapiMessage]
				.reverse()
				.find(
					(msg) =>
						msg.type === "conversation-update" &&
						msg.messages &&
						msg.messages.length > 0
				);

			if (lastConvoUpdate) {
				console.log(
					"Found conversation update with",
					lastConvoUpdate.messages.length,
					"messages"
				);

				// Extract messages manually
				transcriptToSend = lastConvoUpdate.messages
					.filter((msg) => msg.role !== "system")
					.map((msg) => ({
						speaker:
							msg.role === "bot" || msg.role === "assistant" ? "Agent" : "You",
						text: msg.message || "",
						time: new Date().toLocaleTimeString(),
						isFinal: true,
					}));

				console.log("Extracted transcript:", transcriptToSend);
			}
		}

		// EMERGENCY BACKUP: If we still have no transcript, log details and create a minimal one
		if (
			transcriptToSend.length === 0 &&
			window._lastVapiMessage &&
			window._lastVapiMessage.length > 0
		) {
			console.log("EMERGENCY: Creating backup transcript from raw messages");

			// Create a basic transcript from any user/bot messages we can find
			for (const msg of window._lastVapiMessage) {
				console.log("Raw message structure:", Object.keys(msg));

				if (msg.messages) {
					for (const m of msg.messages) {
						if (m.role && (m.message || m.content)) {
							transcriptToSend.push({
								speaker: m.role === "user" ? "You" : "Agent",
								text: m.message || m.content || "",
								time: new Date().toLocaleTimeString(),
								isFinal: true,
							});
						}
					}
				} else if (msg.message && msg.role) {
					transcriptToSend.push({
						speaker: msg.role === "user" ? "You" : "Agent",
						text: msg.message || "",
						time: new Date().toLocaleTimeString(),
						isFinal: true,
					});
				}
			}

			console.log("Emergency transcript created:", transcriptToSend);
		}

		// If still empty, check if vapiRef has any useful data
		if (transcriptToSend.length === 0) {
			console.error("Failed to extract transcript from any source");
			toast.error("Could not find interview data");
			return;
		}

		console.log(
			`Sending ${transcriptToSend.length} messages to /demo-interviews/analyze`
		);

		try {
			const payload = {
				transcript: transcriptToSend,
				job_id: parseInt(jobId),
			};

			console.log("Payload preview:", {
				job_id: payload.job_id,
				transcript_length: payload.transcript.length,
				first_msg: payload.transcript[0],
				last_msg: payload.transcript[payload.transcript.length - 1],
			});

			const result = await axiosInstance.post(
				"/demo-interviews/analyze",
				payload
			);
			console.log("✅ Feedback result:", result.data);
			toast.success("Interview analyzed successfully!");
		} catch (error) {
			console.error("❌ Error generating feedback:", error);
			console.error(error.response ? error.response.data : error.message);
			toast.error("Failed to analyze interview");
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex flex-col items-center justify-center p-6">
			<h1 className="text-3xl font-semibold text-gray-800 mb-10 tracking-tight">
				AI Interview Session
			</h1>

			{/* Avatars for AI & User */}
			<div className="grid grid-cols-2 gap-8 w-full max-w-4xl mb-12">
				{/* AI Card */}
				<div className="relative bg-white/70 backdrop-blur-xl shadow-xl rounded-2xl flex flex-col items-center justify-center p-6 border border-blue-100">
					{/* AI Speaking Pulse */}
					{agentSpeaking && (
						<div className="absolute top-3 right-3 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
					)}
					<img
						src="https://randomuser.me/api/portraits/women/68.jpg"
						alt="AI Recruiter"
						className="w-20 h-20 rounded-full shadow-lg mb-3"
					/>
					<p className="text-lg font-semibold text-blue-800">AI Recruiter</p>
				</div>

				{/* User Card */}
				<div className="relative bg-white/70 backdrop-blur-xl shadow-xl rounded-2xl flex flex-col items-center justify-center p-6 border border-purple-100">
					{userSpeaking && (
						<span className="absolute top-3 right-3 w-3 h-3 bg-purple-500 rounded-full animate-ping"></span>
					)}
					<div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full w-20 h-20 flex items-center justify-center text-2xl font-bold shadow-lg">
						{user?.first_name?.[0]?.toUpperCase() || "U"}
					</div>
					<p className="mt-4 text-lg font-semibold text-gray-700">{fullName}</p>
				</div>
			</div>

			{/* Buttons and Timer */}
			<div className="flex items-center gap-6">
				{interviewStarted ? (
					<button
						onClick={stopInterview}
						className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full text-lg font-medium shadow-md transition-all"
					>
						End Call
					</button>
				) : (
					<button
						onClick={startInterview}
						className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full text-lg font-medium shadow-md transition-all"
					>
						Start Interview
					</button>
				)}

				<span className="inline-flex items-center gap-2 text-gray-700 bg-white px-4 py-2 rounded-full shadow border border-gray-200 text-base font-medium">
					⏱ Time Left:{" "}
					<span className="font-semibold text-gray-800">
						{formatTime(timeLeft)}
					</span>
				</span>
			</div>

			{/* Interview status */}
			{interviewStarted && (
				<p className="mt-8 text-sm text-gray-500 animate-pulse">
					Interview in Progress...
				</p>
			)}
		</div>
	);
};

export default InterviewSession;
