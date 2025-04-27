import React, { useEffect } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import {
	Home,
	Login,
	Signup,
	RecruiterProfile,
	SeekerProfile,
	Applications,
	ApplyJob,
	PostJob,
	EditJob,
	JobDetails,
	ViewApplication,
	ProfileSettings,
	InterviewSession,
	InterviewFeedback,
	NotFound,
} from "./pages";
import Dashboard from "./pages/Dashboard";
import { JobListing, Layout } from "./components";
import { useAuthStore } from "./store/useAuthStore";
import { ToastContainer } from "react-toastify";
import {
	withAuthGuard,
	withPublicGuard,
	withRoleGuard,
} from "./utils/authGuards";

// Apply the guards to your components
const PublicLogin = withPublicGuard(Login);
const PublicSignup = withPublicGuard(Signup);
const ProtectedDashboard = withAuthGuard(Dashboard);
const ProtectedRecruiter = withRoleGuard(RecruiterProfile, ["recruiter"]);
const ProtectedViewApplication = withRoleGuard(ViewApplication, ["recruiter"]);
const ProtectedProfileSettings = withAuthGuard(ProfileSettings);
const ProtectedSeeker = withRoleGuard(SeekerProfile, ["seeker"]);
const ProtectedInterviewSession = withRoleGuard(InterviewSession, ["seeker"]); // Assuming InterviewSession is a seeker-only page
const ProtectedInterviewFeedback = withRoleGuard(InterviewFeedback, ["seeker"]); // Assuming InterviewFeedback is a seeker-only page
const ProtectedPostJob = withRoleGuard(PostJob, ["recruiter"]); // Assuming PostJob is a recruiter-only page
const ProtectedEditJob = withRoleGuard(EditJob, ["recruiter"]); // Assuming EditJob is a recruiter-only page
const ProtectedApplyJob = withAuthGuard(ApplyJob);
const ProtectedApplications = withAuthGuard(Applications, ["recruiter"]); // Assuming Applications is a recruiter/seeker-only page

const routes = createBrowserRouter([
	{
		path: "/",
		element: (
			<Layout>
				<Outlet />
			</Layout>
		),
		children: [
			{
				path: "/",
				element: <Home />,
			},
			{
				path: "/apply-job/:id",
				element: <ProtectedApplyJob />,
			},
			{
				path: "recruiter/applications",
				element: <ProtectedApplications />,
			},
			{
				path: "/job/:id",
				element: <JobDetails />,
			},
			{
				path: "/signup",
				element: <PublicSignup />,
			},
			{
				path: "/login",
				element: <PublicLogin />,
			},
			{
				path: "/dashboard",
				element: <ProtectedDashboard />,
			},

			{
				path: "/post-job",
				element: <ProtectedPostJob />,
			},

			{
				path: "/edit-job/:jobId",
				element: <ProtectedEditJob />,
			},

			{
				path: "/jobs",
				element: <JobListing />,
			},

			{
				path: "/jobs/:id",
				element: <JobDetails />,
			},

			{
				path: "/recruiter/applications/:id",
				element: <ProtectedViewApplication />,
			},
			{
				path: "/recruiter",
				element: <ProtectedRecruiter />,
			},

			{
				path: "/profile/settings",
				element: <ProtectedProfileSettings />,
			},

			{
				path: "*",
				element: <NotFound />,
			},
		],
	},
	{
		path: "/seeker",
		element: <ProtectedSeeker />,
	},

	{
		path: "*",
		element: <NotFound />,
	},

	{
		path: "/feedback/:interviewId",
		element: <ProtectedInterviewFeedback />,
	},

	{
		path: "/interview-session/:applicationId/:jobId",
		element: <ProtectedInterviewSession />,
	},
]);

const App = () => {
	const loadUser = useAuthStore((state) => state.loadUser);

	useEffect(() => {
		// Simple retry mechanism for cold starts
		const tryLoadUser = async (attempts = 0) => {
			try {
				await loadUser();
			} catch (error) {
				console.error("Error loading user:", error);
				// Retry up to 2 times with increasing delay
				if (attempts < 2) {
					const delay = (attempts + 1) * 1000; // 1s, then 2s
					console.log(`Retrying in ${delay / 1000}s...`);
					setTimeout(() => tryLoadUser(attempts + 1), delay);
				}
			}
		};

		tryLoadUser();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<ToastContainer
				position="top-right"
				autoClose={1000}
				hideProgressBar={false}
			/>
			<RouterProvider router={routes} />
		</>
	);
};

export default App;
