import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Set up storage for uploaded files
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/resumes/"); // Directory to save uploaded files
	},
	filename: (req, file, cb) => {
		// Create unique filename with original extension
		const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
		cb(null, uniqueFilename);
	},
});

// Filter for allowed file types
const fileFilter = (req, file, cb) => {
	const allowedTypes = [
		"application/pdf",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"text/plain",
	];

	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(
			new Error("Invalid file type. Only PDF, DOC, DOCX, and TXT are allowed."),
			false
		);
	}
};

// Create upload middleware
const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: 8 * 1024 * 1024, // 8MB limit
	},
});

export default upload;
