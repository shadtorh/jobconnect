import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import client from "../db/init.js";

dotenv.config();

export const signup = async (req, res) => {
	const { email, password, first_name, last_name, role } = req.body;
	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

	if (!email || !password || !first_name || !last_name || !role) {
		return res.status(400).json({ message: "Missing required fields" });
	}

	if (role !== "seeker" && role !== "recruiter") {
		return res.status(400).json({ message: "Invalid role" });
	}
	if (password.length < 6) {
		return res
			.status(400)
			.json({ message: "Password must be at least 6 characters" });
	}

	if (!passwordRegex.test(password)) {
		return res.status(400).json({
			message:
				"Password must contain at least one uppercase letter, one lowercase letter, and one number",
		});
	}
	if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
		return res.status(400).json({ message: "Invalid email format" });
	}
	if (first_name.length < 2 || last_name.length < 2) {
		return res.status(400).json({
			message: "First name and last name must be at least 2 characters",
		});
	}

	try {
		// Check if the user already exists
		const existingUserQuery = "SELECT * FROM users WHERE email = $1";
		const existingUserResult = await client.query(existingUserQuery, [email]);
		if (existingUserResult.rows.length > 0) {
			return res.status(400).json({ message: "User already exists" });
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Insert the new user into the database
		const query = `
            INSERT INTO users (email, password, first_name, last_name, role) 
            VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role, first_name, last_name
        `;
		const result = await client.query(query, [
			email,
			hashedPassword,
			first_name,
			last_name,
			role,
		]);
		const user = result.rows[0];

		const token = jwt.sign(
			{
				userId: user.id,
				email: user.email,
				role: user.role,
				first_name: user.first_name,
				last_name: user.last_name,
			},
			process.env.JWT_SECRET,
			{ expiresIn: "7d" }
		);

		// Return token in response body instead of setting cookie
		res.status(201).json({
			token, // Include token in response
			user: {
				id: user.id,
				email: user.email,
				role: user.role,
				first_name: user.first_name,
				last_name: user.last_name,
			},
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Error signing up" });
	}
};

export const login = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ message: "Missing required fields" });
	}

	try {
		// Check if the user exists
		const query = "SELECT * FROM users WHERE email = $1";
		const result = await client.query(query, [email]);
		const user = result.rows[0];

		if (!user) {
			return res.status(400).json({ message: "User not found" });
		}

		// Verify the password
		const isPasswordCorrect = await bcrypt.compare(password, user.password);
		if (!isPasswordCorrect) {
			return res.status(400).json({ message: "Invalid password" });
		}

		// Generate JWT token
		const token = jwt.sign(
			{
				userId: user.id,
				email: user.email,
				role: user.role,
				first_name: user.first_name,
				last_name: user.last_name,
			},
			process.env.JWT_SECRET,
			{
				expiresIn: "7d",
			}
		);

		// Return token in response body instead of setting cookie
		res.status(200).json({
			message: "Login successful",
			token, // Include token in response
			user: {
				id: user.id,
				email: user.email,
				role: user.role,
				first_name: user.first_name,
				last_name: user.last_name,
			},
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Error logging in" });
	}
};

export const logout = (req, res) => {
	// No need to clear cookies, client will remove from localStorage
	res.status(200).json({ message: "Logout successful" });
};

export const getUser = async (req, res) => {
	try {
		const user = req.user;
		// console.log("User object in getUser:", JSON.stringify(user, null, 2));

		res.status(200).json({
			user: {
				id: user.userId,
				email: user.email,
				role: user.role,

				first_name: user.first_name,
				last_name: user.last_name,
			},
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Error getting user" });
	}
};

export const updateProfile = async (req, res) => {
	try {
		// With multer middleware, form fields are in req.body
		const { first_name, last_name } = req.body;
		const userId = req.user.userId;

		console.log("Updating profile with:", {
			first_name,
			last_name,
		});

		const updatedUser = await client.query(
			"UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3 RETURNING *",
			[first_name, last_name, userId]
		);

		// Create a new JWT token
		const token = jwt.sign(
			{
				userId: updatedUser.rows[0].id,
				email: updatedUser.rows[0].email,
				role: updatedUser.rows[0].role,
				first_name: updatedUser.rows[0].first_name,
				last_name: updatedUser.rows[0].last_name,
			},
			process.env.JWT_SECRET,
			{ expiresIn: "7d" }
		);

		// Return token in response
		res.status(200).json({
			message: "Profile updated successfully",
			token, // Include token in response
			user: {
				id: updatedUser.rows[0].id,
				email: updatedUser.rows[0].email,
				role: updatedUser.rows[0].role,
				first_name: updatedUser.rows[0].first_name,
				last_name: updatedUser.rows[0].last_name,
			},
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Error updating profile" });
	}
};
