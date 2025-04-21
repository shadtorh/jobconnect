// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { IoCallOutline, IoTimeOutline } from "react-icons/io5";
// import { toast } from "react-toastify";
// import { axiosInstance } from "../utils/axios";
// import { getVapiInstance, onVapiReady } from "../services/vapiService";
// import { useAuthStore } from "../store/useAuthStore";

// const InterviewSession = () => {
// 	const { applicationId, jobId } = useParams();
// 	const navigate = useNavigate();
// 	const { user } = useAuthStore();

// 	const [vapiInstance, setVapiInstance] = useState(null);
// 	const [vapiError, setVapiError] = useState(null);
// 	const [isActive, setIsActive] = useState(false);
// 	const [isLoading, setIsLoading] = useState(true);
// 	const [isSaving, setIsSaving] = useState(false);
// 	const [jobDetails, setJobDetails] = useState(null);
// 	const [transcript, setTranscript] = useState([]);
// 	const [agentSpeaking, setAgentSpeaking] = useState(false);
// 	const [userSpeaking, setUserSpeaking] = useState(false);
// 	const [timeRemaining, setTimeRemaining] = useState(900);

// 	const userName = user?.name || user?.email?.split("@")[0] || "Candidate";
// 	const userInitial = userName.charAt(0).toUpperCase();

// 	const transcriptRef = useRef(null);
// 	const timerRef = useRef(null);
// 	const callEndedHandledRef = useRef(false);

// 	// Add this near the top of your component
// 	useEffect(() => {
// 		// Test direct connection to server
// 		const testServerConnection = async () => {
// 			try {
// 				console.log("Testing direct connection to server...");
// 				const response = await fetch(
// 					"http://localhost:5000/api/demo-interviews/test",
// 					{
// 						method: "GET",
// 						credentials: "include",
// 						headers: {
// 							"Content-Type": "application/json",
// 						},
// 					}
// 				);

// 				const data = await response.json();
// 				console.log("Server connection test result:", data);
// 			} catch (error) {
// 				console.error("Server connection test failed:", error);
// 			}
// 		};

// 		testServerConnection();
// 	}, []);

// 	const checkBrowserCompatibility = () => {
// 		const issues = [];

// 		if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
// 			issues.push("Your browser doesn't support accessing the microphone");
// 		}

// 		if (
// 			typeof AudioContext === "undefined" &&
// 			typeof webkitAudioContext === "undefined"
// 		) {
// 			issues.push("Your browser doesn't support audio processing");
// 		}

// 		if (!window.WebSocket) {
// 			issues.push("Your browser doesn't support WebSockets");
// 		}

// 		if (issues.length > 0) {
// 			const message = `Browser compatibility issues: ${issues.join(", ")}`;
// 			console.error(message);
// 			toast.error(message);
// 			setVapiError(message);
// 			return false;
// 		}

// 		return true;
// 	};

// 	const validateApiKey = () => {
// 		const apiKey = import.meta.env.VITE_VAPI_API_KEY;

// 		if (!apiKey) {
// 			const msg = "Missing VAPI_API_KEY in environment variables";
// 			console.error(msg);
// 			toast.error(msg);
// 			setVapiError(msg);
// 			return false;
// 		}

// 		if (apiKey.length < 20) {
// 			const msg = "VAPI_API_KEY appears to be invalid (too short)";
// 			console.error(msg);
// 			toast.error(msg);
// 			setVapiError(msg);
// 			return false;
// 		}

// 		console.log("API key format appears valid (correct length)");
// 		return true;
// 	};

// 	const handleMessage = useCallback((message) => {
// 		console.log("Received message:", message);

// 		if (message.type === "transcript" && message.transcript) {
// 			// For the assistant (AI), show partial transcripts in real-time
// 			if (message.role === "assistant") {
// 				// Create new message object
// 				const newMessage = {
// 					speaker: "Agent",
// 					text: message.transcript,
// 					time: new Date().toLocaleTimeString([], {
// 						hour: "2-digit",
// 						minute: "2-digit",
// 					}),
// 					isFinal: message.isFinal || false,
// 				};

// 				// For partial messages, update the last message if it's from the assistant and not final
// 				if (!message.isFinal) {
// 					setTranscript((prev) => {
// 						const lastMsg = prev[prev.length - 1];
// 						// If last message is from agent and not final, update it
// 						if (lastMsg && lastMsg.speaker === "Agent" && !lastMsg.isFinal) {
// 							const updated = [...prev];
// 							updated[updated.length - 1] = newMessage;
// 							return updated;
// 						}
// 						// Otherwise add a new partial message
// 						return [...prev, newMessage];
// 					});
// 				} else {
// 					// For final messages, always add a new one
// 					console.log("Adding final message to transcript:", newMessage);
// 					setTranscript((prev) => [...prev, { ...newMessage, isFinal: true }]);
// 				}
// 			}

// 			// For the user, only add final transcripts
// 			if (message.role === "user" && message.isFinal) {
// 				const newMessage = {
// 					speaker: "You",
// 					text: message.transcript,
// 					time: new Date().toLocaleTimeString([], {
// 						hour: "2-digit",
// 						minute: "2-digit",
// 					}),
// 					isFinal: true,
// 				};

// 				console.log("Adding user message to transcript:", newMessage);
// 				setTranscript((prev) => [...prev, newMessage]);
// 			}
// 		}

// 		// Update user speaking state
// 		if (message.type === "transcript" && message.role === "user") {
// 			setUserSpeaking(message.isFinal === false);
// 		}
// 	}, []);

// 	useEffect(() => {
// 		validateApiKey();
// 		const instance = getVapiInstance(); // Check if Vapi is already initialized and get the instance

// 		if (instance) {
// 			setVapiInstance(instance);
// 			setVapiError(null);
// 			checkBrowserCompatibility();
// 		} else {
// 			const removeListener = onVapiReady((instance) => {
// 				console.log("Vapi instance is now ready");
// 				setVapiInstance(instance);
// 				setVapiError(null);
// 				checkBrowserCompatibility();
// 			}); // Add listener for Vapi readiness

// 			return () => {
// 				removeListener(); // Clean up the listener when the component unmounts
// 			};
// 		}
// 	}, []);

// 	useEffect(() => {
// 		const fetchJobDetails = async () => {
// 			if (!jobId) {
// 				toast.error("Missing job information");
// 				navigate(-1);
// 				return;
// 			}

// 			try {
// 				setIsLoading(true);
// 				const response = await axiosInstance.get(
// 					`/demo-interviews/job/${jobId}`
// 				);

// 				if (response.data && response.data.success) {
// 					setJobDetails(response.data.data);
// 				} else {
// 					toast.error("Could not load job details");
// 					navigate(-1);
// 				}
// 			} catch (error) {
// 				console.error("Error fetching job details:", error);
// 				toast.error("Failed to load interview data");
// 				navigate(-1);
// 			} finally {
// 				setIsLoading(false);
// 			}
// 		};

// 		fetchJobDetails();
// 	}, [jobId, navigate]);

// 	useEffect(() => {
// 		if (!vapiInstance) return;

// 		const handleCallStarted = () => {
// 			setIsActive(true);
// 			setTranscript([]);
// 			callEndedHandledRef.current = false;
// 			startTimer();
// 			toast.success("Interview started");
// 		};

// 		const handleSpeechUpdate = (data) => {
// 			setAgentSpeaking(data.speechStatus === "speaking");
// 		};

// 		const handleError = (error) => {
// 			console.error("Interview error:", error);
// 			toast.error(`Interview error: ${error.errorMsg || "Unknown error"}`);
// 			handleCallEnded({ error: error.errorMsg });
// 		};

// 		// Update your handleCallEnded function:
// 		const handleCallEnded = async (event) => {
// 			if (callEndedHandledRef.current) {
// 				console.log("Call ended already handled, skipping");
// 				return;
// 			}

// 			console.log("🛑 Call ended event triggered", event);
// 			callEndedHandledRef.current = true;

// 			toast.info("Interview has ended");

// 			// Make sure timer stops
// 			if (timerRef.current) {
// 				clearInterval(timerRef.current);
// 				timerRef.current = null;
// 			}

// 			setIsActive(false);
// 			setAgentSpeaking(false);
// 			setUserSpeaking(false);

// 			// IMPORTANT: Get the current transcript directly instead of relying on state closure
// 			// This fixes a potential stale closure issue
// 			const currentTranscript = [...transcript]; // Create a copy of the current transcript

// 			// Log the actual transcript we're about to save
// 			console.log("🎬 End of interview transcript:", {
// 				length: currentTranscript.length,
// 				firstMessage: currentTranscript[0]?.text.substring(0, 30) || "none",
// 				lastMessage:
// 					currentTranscript[currentTranscript.length - 1]?.text.substring(
// 						0,
// 						30
// 					) || "none",
// 			});

// 			// Auto-save the interview if there's a transcript
// 			if (currentTranscript.length > 0) {
// 				toast.info("Saving your interview results...");

// 				// Wait a moment for any final transcript updates (reduced to 500ms)
// 				setTimeout(async () => {
// 					try {
// 						setIsSaving(true);

// 						// Prepare the payload - use the captured transcript
// 						const payload = {
// 							job_id: parseInt(jobId),
// 							transcript: currentTranscript, // Use the captured transcript
// 							...(applicationId
// 								? { application_id: parseInt(applicationId) }
// 								: {}),
// 						};

// 						console.log("Auto-saving interview with payload:", {
// 							job_id: payload.job_id,
// 							application_id: payload.application_id || "none",
// 							transcript_length: payload.transcript.length,
// 						});

// 						const response = await axiosInstance.post(
// 							"/demo-interviews",
// 							payload
// 						);

// 						console.log("Auto-save response:", response.data);
// 						toast.success("Interview saved with AI feedback and score!");

// 						// Navigate after a short delay
// 						setTimeout(() => {
// 							navigate("/dashboard");
// 						}, 1500);
// 					} catch (error) {
// 						console.error("Failed to auto-save interview:", error);

// 						if (error.response) {
// 							console.error("Error response data:", error.response.data);
// 							console.error("Error response status:", error.response.status);
// 						}

// 						toast.error(
// 							"Failed to save automatically. Please use the manual save button."
// 						);
// 						setIsSaving(false); // Allow manual saving as fallback
// 					}
// 				}, 500); // reduced from 1000ms to 500ms
// 			} else {
// 				console.log("No transcript to save: transcript length is 0");
// 				toast.info("No conversation recorded");
// 			}
// 		};

// 		vapiInstance.on("call-started", handleCallStarted);
// 		vapiInstance.on("message", handleMessage);
// 		vapiInstance.on("speech-update", handleSpeechUpdate);
// 		vapiInstance.on("error", handleError);
// 		vapiInstance.on("call-ended", handleCallEnded);

// 		const handleAllEvents = (event) => {
// 			if (event.type === "transcript" || event.type === "message") {
// 				console.log("Vapi transcript event:", event);
// 			} else if (
// 				event.type === "call-started" ||
// 				event.type === "call-ended" ||
// 				event.type === "error"
// 			) {
// 				console.log("Vapi important event:", event);
// 			}
// 		};
// 		vapiInstance.on("*", handleAllEvents);

// 		return () => {
// 			if (vapiInstance) {
// 				vapiInstance.off("call-started", handleCallStarted);
// 				vapiInstance.off("message", handleMessage);
// 				vapiInstance.off("speech-update", handleSpeechUpdate);
// 				vapiInstance.off("error", handleError);
// 				vapiInstance.off("call-ended", handleCallEnded);
// 				vapiInstance.off("*", handleAllEvents);
// 			}

// 			if (timerRef.current) {
// 				clearInterval(timerRef.current);
// 			}
// 		};
// 	}, [vapiInstance, applicationId, jobId, navigate, handleMessage]);

// 	useEffect(() => {
// 		if (transcriptRef.current) {
// 			transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
// 		}
// 	}, [transcript]); // Scroll to bottom when new messages are added

// 	const startTimer = () => {
// 		if (timerRef.current) clearInterval(timerRef.current);

// 		timerRef.current = setInterval(() => {
// 			setTimeRemaining((prev) => {
// 				if (prev <= 1) {
// 					clearInterval(timerRef.current);
// 					timerRef.current = null;
// 					toast.warn("Time limit reached");

// 					if (vapiInstance && isActive) {
// 						vapiInstance.stop();
// 					}

// 					return 0;
// 				}
// 				return prev - 1;
// 			});
// 		}, 1000);
// 	};

// 	const formatTime = (seconds) => {
// 		const minutes = Math.floor(seconds / 60);
// 		const remainingSecs = seconds % 60;
// 		return `${minutes}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
// 	};

// 	const startInterview = async () => {
// 		if (!vapiInstance) {
// 			toast.error("Interview system not available");
// 			return;
// 		}

// 		if (!jobDetails) {
// 			toast.error("Job details not loaded");
// 			return;
// 		}

// 		if (isActive) {
// 			toast.warn("Interview already in progress");
// 			return;
// 		}

// 		try {
// 			console.log("Requesting microphone permission...");
// 			await navigator.mediaDevices.getUserMedia({ audio: true });
// 			console.log("Microphone permission granted");
// 		} catch (err) {
// 			console.error("Microphone permission error:", err);
// 			toast.error("Microphone access denied. Please allow microphone access.");
// 			return;
// 		}

// 		const agentConfig = {
// 			model: {
// 				provider: "openai",
// 				model: "gpt-3.5-turbo",
// 				messages: [
// 					{
// 						role: "system",
// 						content: `You are Cassandra, a professional interviewer for ${jobDetails.company_name}.
// 						You're interviewing ${userName} for the ${jobDetails.title} position.

// 						Job details: ${jobDetails.description}

// 						Interview guidelines:
// 						1. Always address the candidate as ${userName} throughout the interview
// 						2. Start by introducing yourself and the company
// 						3. Ask job-specific questions related to the role of ${jobDetails.title}
// 						4. Focus on skills mentioned in the job description
// 						5. Ask for specific examples from the candidate's experience
// 						6. Keep your responses concise (1-3 sentences maximum)
// 						7. Wait for the candidate to respond after each question to give them time to think and prepare their answer
// 						8. Ask follow-up questions to build a strong relationship with the candidate
// 						9. Keep the conversation engaging and interesting
// 						10. Ask open-ended questions to elicit more information from the candidate
// 						11. Be respectful and professional at all times
// 						12. Keep the conversation focused on the interview topic
// 						13. Keep the conversation short and to the point
// 						14. Keep the conversation engaging and interesting
// 						15. Ask follow-up questions to build a strong relationship with the candidate
// 						16. Keep the conversation short and to the point
// 						17. Keep the conversation engaging and interesting
// 						18. Ask open-ended questions to elicit more information from the candidate`,
// 					},
// 				],
// 			},
// 			voice: {
// 				provider: "playht",
// 				voiceId: "jennifer",
// 			},
// 			// Add an explicit first message to ensure the AI speaks immediately
// 			firstMessage: `Hello ${userName}, I'm Cassandra from ${jobDetails.company_name}. Thanks for interviewing for our ${jobDetails.title} position today. Let's get started. `,
// 		};

// 		try {
// 			// Set a flag to track if we've handled the start
// 			let callHandled = false;

// 			// First, manually set active state before starting call
// 			// This is a workaround if the event isn't firing properly
// 			setTimeout(() => {
// 				if (!callHandled && !isActive) {
// 					setIsActive(true);
// 					startTimer();
// 					callHandled = true;
// 					console.log("Manual activation after timeout");
// 				}
// 			}, 3000);

// 			// Start the call immediately
// 			console.log("Starting call with config:", JSON.stringify(agentConfig));
// 			vapiInstance.start(agentConfig);
// 			toast.info("Starting interview...");

// 			// The call-started event will still be handled by the main useEffect
// 			// which will properly setup all other event handlers
// 		} catch (error) {
// 			console.error("Failed to start interview:", error);
// 			toast.error(`Interview failed to start: ${error.message}`);
// 		}
// 	};

// 	const endInterview = () => {
// 		if (!isActive || callEndedHandledRef.current) return;

// 		if (window.confirm("Are you sure you want to end this interview?")) {
// 			// Set flag immediately to prevent duplicate handling
// 			callEndedHandledRef.current = true;

// 			// Stop timer immediately
// 			if (timerRef.current) {
// 				clearInterval(timerRef.current);
// 				timerRef.current = null;
// 			}

// 			// Stop Vapi
// 			if (vapiInstance) {
// 				vapiInstance.stop();

// 				// If for some reason the call-ended event doesn't fire,
// 				// still navigate to dashboard after a timeout
// 				setTimeout(() => {
// 					if (document.visibilityState === "visible") {
// 						// only if still on page
// 						navigate("/dashboard");
// 					}
// 				}, 3000);
// 			}
// 		}
// 	};

// 	const manualSaveInterview = async () => {
// 		if (transcript.length === 0) {
// 			toast.info("No conversation to save");
// 			return;
// 		}

// 		setIsSaving(true);

// 		try {
// 			// Prepare a simplified payload with all required fields
// 			const payload = {
// 				job_id: parseInt(jobId), // Make sure this is a number
// 				transcript: transcript,
// 				// Only include application_id if it exists and is not null
// 				...(applicationId ? { application_id: parseInt(applicationId) } : {}),
// 			};

// 			console.log(
// 				"🔥 SAVING: About to send request to:",
// 				axiosInstance.defaults.baseURL + "/demo-interviews"
// 			);

// 			// Print the first part of the payload to avoid huge logs
// 			console.log("Payload preview:", {
// 				job_id: payload.job_id,
// 				application_id: payload.application_id || "none",
// 				transcript_length: payload.transcript.length,
// 				transcript_sample: payload.transcript[0],
// 			});

// 			console.log("Saving interview with payload:", {
// 				job_id: payload.job_id,
// 				application_id: payload.application_id || "none",
// 				transcript_length: transcript.length,
// 			});

// 			const response = await axiosInstance.post("/demo-interviews", payload);

// 			console.log("Save response status:", response.status);
// 			console.log("Save response data:", response.data);

// 			toast.success("Interview saved with AI feedback and score!");

// 			// Navigate after a short delay
// 			setTimeout(() => {
// 				navigate("/dashboard");
// 			}, 1000);
// 		} catch (error) {
// 			console.error("Failed to save interview:", error);

// 			// More detailed error logging
// 			if (error.response) {
// 				console.error("Error response data:", error.response.data);
// 				console.error("Error response status:", error.response.status);
// 			}

// 			toast.error(`Save failed: ${error.message}`);
// 		} finally {
// 			setIsSaving(false);
// 		}
// 	};

// 	return (
// 		<div className="bg-white min-h-screen flex flex-col">
// 			<header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
// 				<div className="flex items-center">
// 					<h1 className="text-xl font-medium text-gray-800">
// 						{isActive ? "Interview in Progress" : "Interview Session"}
// 					</h1>
// 				</div>

// 				<div className="flex items-center gap-4">
// 					{isActive && (
// 						<button
// 							onClick={endInterview}
// 							className="flex items-center px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full"
// 						>
// 							<IoCallOutline className="w-4 h-4 mr-1" /> End Call
// 						</button>
// 					)}

// 					<div className="flex items-center gap-2 text-gray-700">
// 						<IoTimeOutline className="w-5 h-5" />
// 						<span>{formatTime(timeRemaining)}</span>
// 					</div>
// 				</div>
// 			</header>

// 			{isLoading ? (
// 				<div className="flex-1 flex items-center justify-center">
// 					<div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
// 				</div>
// 			) : (
// 				<div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
// 					<div className="flex justify-center gap-32 mb-10 mt-8">
// 						<div className="flex flex-col items-center">
// 							<div
// 								className={`w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-2 relative ${
// 									agentSpeaking ? "ring-2 ring-blue-500 ring-offset-2" : ""
// 								}`}
// 							>
// 								<IoCallOutline className="w-8 h-8 text-blue-700" />
// 								{agentSpeaking && (
// 									<div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
// 										Speaking
// 									</div>
// 								)}
// 							</div>
// 							<span className="text-lg font-medium text-gray-800">
// 								AI Interviewer
// 							</span>
// 						</div>

// 						<div className="flex flex-col items-center">
// 							<div
// 								className={`w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold mb-2 relative ${
// 									userSpeaking ? "ring-2 ring-purple-500 ring-offset-2" : ""
// 								}`}
// 							>
// 								{userInitial}
// 								{userSpeaking && (
// 									<div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
// 										Speaking
// 									</div>
// 								)}
// 							</div>
// 							<span className="text-lg font-medium text-gray-800">
// 								{userName}
// 							</span>
// 						</div>
// 					</div>

// 					<div className="flex justify-center gap-4 mb-6">
// 						{agentSpeaking && (
// 							<div className="flex items-center gap-2">
// 								<div className="flex items-end space-x-1">
// 									<div className="w-1.5 h-3 bg-blue-400 rounded-full animate-[wave_0.7s_ease-in-out_infinite_alternate]"></div>
// 									<div className="w-1.5 h-5 bg-blue-500 rounded-full animate-[wave_0.5s_ease-in-out_infinite_alternate_0.1s]"></div>
// 									<div className="w-1.5 h-7 bg-blue-600 rounded-full animate-[wave_0.4s_ease-in-out_infinite_alternate_0.2s]"></div>
// 									<div className="w-1.5 h-5 bg-blue-500 rounded-full animate-[wave_0.5s_ease-in-out_infinite_alternate_0.3s]"></div>
// 									<div className="w-1.5 h-3 bg-blue-400 rounded-full animate-[wave_0.7s_ease-in-out_infinite_alternate_0.4s]"></div>
// 								</div>
// 							</div>
// 						)}

// 						{userSpeaking && (
// 							<div className="flex items-center gap-2">
// 								<div className="flex items-end space-x-1">
// 									<div className="w-1.5 h-3 bg-purple-400 rounded-full animate-[wave_0.7s_ease-in-out_infinite_alternate]"></div>
// 									<div className="w-1.5 h-5 bg-purple-500 rounded-full animate-[wave_0.5s_ease-in-out_infinite_alternate_0.1s]"></div>
// 									<div className="w-1.5 h-7 bg-purple-600 rounded-full animate-[wave_0.4s_ease-in-out_infinite_alternate_0.2s]"></div>
// 									<div className="w-1.5 h-5 bg-purple-500 rounded-full animate-[wave_0.5s_ease-in-out_infinite_alternate_0.3s]"></div>
// 									<div className="w-1.5 h-3 bg-purple-400 rounded-full animate-[wave_0.7s_ease-in-out_infinite_alternate_0.4s]"></div>
// 								</div>
// 							</div>
// 						)}
// 					</div>

// 					<div
// 						className="flex-1 bg-gray-50 rounded-2xl p-5 mb-4 overflow-y-auto"
// 						ref={transcriptRef}
// 					>
// 						{transcript.length > 0 ? (
// 							<div className="flex flex-col gap-6">
// 								{transcript.map((msg, index) => (
// 									<div
// 										key={index}
// 										className={`flex ${
// 											msg.speaker === "Agent" ? "" : "justify-end"
// 										}`}
// 									>
// 										{msg.speaker === "Agent" && (
// 											<div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
// 												<IoCallOutline className="w-5 h-5 text-blue-700" />
// 											</div>
// 										)}

// 										<div
// 											className={`max-w-[75%] rounded-2xl p-4 ${
// 												msg.speaker === "Agent"
// 													? "bg-white border border-gray-200 text-gray-800"
// 													: "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
// 											}`}
// 										>
// 											<p className="text-base">{msg.text}</p>
// 											<p className="text-xs mt-1 opacity-70 text-right">
// 												{msg.time}
// 											</p>
// 										</div>

// 										{msg.speaker !== "Agent" && (
// 											<div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold ml-4">
// 												{userInitial}
// 											</div>
// 										)}
// 									</div>
// 								))}
// 							</div>
// 						) : (
// 							<div className="h-full flex flex-col items-center justify-center">
// 								{isActive ? (
// 									<p className="text-gray-500">
// 										Waiting for conversation to begin...
// 									</p>
// 								) : (
// 									<p className="text-gray-500 mb-4">
// 										Your interview will begin when you click Start
// 									</p>
// 								)}
// 							</div>
// 						)}
// 					</div>

// 					<div className="flex justify-center mb-4">
// 						{isActive ? (
// 							<div className="flex gap-6">
// 								<button
// 									onClick={endInterview}
// 									className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-sm"
// 								>
// 									<IoCallOutline className="w-8 h-8" />
// 								</button>
// 							</div>
// 						) : (
// 							!isSaving && (
// 								<button
// 									onClick={startInterview}
// 									disabled={!vapiInstance || !!vapiError || !jobDetails}
// 									className="px-8 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700
//                 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center text-lg"
// 								>
// 									<IoCallOutline className="w-6 h-6 mr-2" /> Start Interview
// 								</button>
// 							)
// 						)}
// 					</div>

// 					{/* Add this after the existing buttons section */}
// 					{!isActive && transcript.length > 0 && !isSaving && (
// 						<div className="mt-4 flex justify-center">
// 							<button
// 								onClick={manualSaveInterview}
// 								className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700
//       transition-colors flex items-center text-lg shadow-md"
// 							>
// 								Save & Return to Dashboard
// 							</button>
// 						</div>
// 					)}

// 					{/* Show saving indicator */}
// 					{isSaving && (
// 						<div className="mt-4 flex justify-center">
// 							<div className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg flex items-center">
// 								<div className="w-5 h-5 border-t-2 border-b-2 border-gray-700 rounded-full animate-spin mr-3"></div>
// 								Saving interview results...
// 							</div>
// 						</div>
// 					)}
// 				</div>
// 			)}
// 		</div>
// 	);
// };

// export default InterviewSession;

import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useInterviewStore } from "../store/useInterviewStore";
import Vapi from "@vapi-ai/web";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// Load your Vapi API Key
const apiKey = import.meta.env.VITE_VAPI_API_KEY;

const InterviewSession = () => {
	// Interview state
	const [interviewStarted, setInterviewStarted] = useState(false);
	const [userSpeaking, setUserSpeaking] = useState(false); // User speaking state
	const [agentSpeaking, setAgentSpeaking] = useState(false); // Agent speaking state
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

		// vapiRef.current.on("speech-start", () => {
		// 	console.log("Assistant speech has started.");
		// 	setUserSpeaking(false); // Reset user speaking state when AI starts speaking
		// });

		// vapiRef.current.on("speech-end", () => {
		// 	console.log("Assistant speech has ended.");
		// 	setUserSpeaking(true); // Reset user speaking state when AI stops speaking
		// });

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

		// vapiRef.current.on("message", (message) => {
		// 	console.log(message);
		// });

		const handleMessage = (message) => {
			console.log("Message received:", message);
			// Handle transcript updates if needed here...

			// Update user speaking state based on user transcript messages
			if (message.type === "transcript" && message.role === "user") {
				setUserSpeaking(!message.isFinal); // User is speaking if transcript is not final
				if (!message.isFinal) {
					setAgentSpeaking(false); // Ensure agent speaking is off if user starts
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

	// Format seconds into MM:SS
	const formatTime = (seconds) => {
		const min = String(Math.floor(seconds / 60)).padStart(2, "0");
		const sec = String(seconds % 60).padStart(2, "0");
		return `${min}:${sec}`;
	};

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
	const stopInterview = () => {
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
					console.log("Call stopped");
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
