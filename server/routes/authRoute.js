// Signup route
import express from "express";
import {
	signup,
	login,
	logout,
	getUser,
	updateProfile,
} from "../controllers/authController.js";
import { authenticateUser } from "../middleware/authenticate.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/me", authenticateUser, getUser);

// Login route

router.put("/update-profile", authenticateUser, updateProfile);

export default router;
