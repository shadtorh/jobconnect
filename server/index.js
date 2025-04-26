import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoute from "./routes/authRoute.js";
import jobsRoute from "./routes/jobsRoute.js";
import notificationRoute from "./routes/notificationRoutes.js"; // Import the notification route
import applicationRoute from "./routes/applicationRoute.js"; // Import the application route
import demoInterviewRoutes from "./routes/demoInterviewRoutes.js"; // Import the demo interview route
dotenv.config();

const app = express();

const allowedOrigin = [
	"http://localhost:5173",
	"https://jobconnect-eight.vercel.app",
];

app.use(
	cors({
		origin: allowedOrigin,
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
		allowedHeaders: ["Content-Type", "Authorization"], // Add any other headers you need
	})
); // Allow requests from the client app

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/jobs", jobsRoute);
app.use("/api/demo-interviews", demoInterviewRoutes); // Uncomment if you have an interview route
app.use("/api/notifications", notificationRoute);
app.use("/api/applications", applicationRoute); // Import and use the application route

// app.get("/", (req, res) => res.send("Server is running..."));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
