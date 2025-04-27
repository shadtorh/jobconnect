import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authenticateUser = (req, res, next) => {
	// Get token from header instead of cookie
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ message: "Authentication required" });
	}

	// Extract token from "Bearer <token>"
	const token = authHeader.split(" ")[1];

	if (!token) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (!decoded) {
			return res.status(401).json({ message: "Unauthorized" });
		}
		req.user = decoded;
		// console.log("Authenticated user:", decoded);

		next();
	} catch (err) {
		return res.status(403).json({ message: "Invalid or expired token" });
	}
};

// Middleware for recruiter-only routes
export const recruiterOnly = (req, res, next) => {
	// Check if the user exists and has the recruiter role
	if (!req.user || req.user.role !== "recruiter") {
		return res.status(403).json({
			success: false,
			message: "Access denied. Recruiter privileges required.",
		});
	}

	// If user is a recruiter, proceed to the next middleware/route handler
	next();
};

// You can also add other role-based middleware functions here
export const jobSeekerOnly = (req, res, next) => {
	if (!req.user || req.user.role !== "jobseeker") {
		return res.status(403).json({
			success: false,
			message: "Access denied. Job seeker privileges required.",
		});
	}
	next();
};

// Admin only middleware
export const adminOnly = (req, res, next) => {
	if (!req.user || req.user.role !== "admin") {
		return res.status(403).json({
			success: false,
			message: "Access denied. Admin privileges required.",
		});
	}
	next();
};
