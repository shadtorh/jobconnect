import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const client = new Pool({
	connectionString: process.env.DATABASE_URL,
});

const createUsersTable = async () => {
	const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      role VARCHAR(50) NOT NULL CHECK (role IN ('seeker', 'recruiter')),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
	try {
		await client.query(query);
		console.log("Users table created successfully.");
	} catch (err) {
		console.error("Error creating users table:", err);
	}
};

// const createLocationsTable = async () => {
// 	const query = `
//     CREATE TABLE IF NOT EXISTS job_locations (
//       id SERIAL PRIMARY KEY,
//       location_name TEXT NOT NULL UNIQUE
//     )
//   `;
// 	try {
// 		await client.query(query);
// 		console.log("Job locations table created successfully.");
// 	} catch (err) {
// 		console.error("Error creating job locations table:", err);
// 	}
// };

// const createCategoriesTable = async () => {
// 	const query = `
//     CREATE TABLE IF NOT EXISTS job_categories (
//       id SERIAL PRIMARY KEY,
//       category_name TEXT NOT NULL UNIQUE
//     )
//   `;
// 	try {
// 		await client.query(query);
// 		console.log("Job categories table created successfully.");
// 	} catch (err) {
// 		console.error("Error creating job categories table:", err);
// 	}
// };

const createJobsTable = async () => {
	const query = `
    CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY,
      recruiter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      company_name TEXT NOT NULL,
      location TEXT NOT NULL,
      category TEXT NOT NULL,
      job_type VARCHAR(50) NOT NULL,
      experience_level VARCHAR(50) NOT NULL,
      salary_min INTEGER NOT NULL,
      salary_max INTEGER NOT NULL,
      description TEXT NOT NULL,
      status VARCHAR(50) NOT NULL, CHECK (status IN ('active', 'close', 'draft')),
      posted_date DATE NOT NULL,
      expiry_date DATE NOT NULL,
      responsibilities TEXT,
      required_skills TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
	try {
		await client.query(query);
		console.log("Jobs table created successfully.");
	} catch (err) {
		console.error("Error creating jobs table:", err);
	}
};

const createApplicationsTable = async () => {
	const query = `
    CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
      job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      seeker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      resume TEXT NOT NULL,
      position TEXT NOT NULL,
      cover_letter TEXT,
      motivationQuestion TEXT,
      uniqueQuestion TEXT,
      status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
      viewed_by_recruiter BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
	try {
		await client.query(query);
		console.log("Applications table created successfully.");
	} catch (err) {
		console.error("Error creating applications table:", err);
	}
};

const createNotificationsTable = async () => {
	const query = `
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      related_id INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
	try {
		await client.query(query);
		console.log("Notifications table created successfully.");
	} catch (err) {
		console.error("Error creating notifications table:", err);
	}
};

const createDemoInterviewsTable = async () => {
	const query = `
    CREATE TABLE IF NOT EXISTS demo_interviews (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Renamed from seeker_id for consistency
      job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      application_id INTEGER REFERENCES applications(id) ON DELETE SET NULL, -- Use SET NULL or CASCADE based on desired behavior
      transcript JSONB, -- Store transcript objects
      completed_at TIMESTAMPTZ DEFAULT NOW(),
      vapi_call_id TEXT, -- Keep if needed

      -- Renamed feedback fields for clarity and consistency
      feedback_summary TEXT,
      feedback_recommendation TEXT,
      feedback_recommendation_msg TEXT,
      rating_technical DECIMAL(3,1), -- Use DECIMAL for ratings if needed
      rating_communication DECIMAL(3,1),
      rating_problem_solving DECIMAL(3,1),
      rating_experience DECIMAL(3,1),
      score DECIMAL(3,1), -- Optional overall score (can be calculated or from LLM)

      created_at TIMESTAMPTZ DEFAULT NOW() -- Added created_at if missing
      -- removed duplicate completed_at
    )
  `;

	try {
		await client.query(query);
		console.log("Demo Interviews table checked/created successfully.");
	} catch (err) {
		console.error("Error creating demo interviews table:", err);
	}
};

// Call functions to create the tables
const initializeTables = async () => {
	await createUsersTable();
	await createJobsTable();
	await createApplicationsTable();
	await createNotificationsTable();
	await createDemoInterviewsTable();
};

initializeTables();

export default client;
