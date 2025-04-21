import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const Dashboard = () => {
	const { user, isLoading } = useAuthStore();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/login" />;
	}

	// Redirect based on role
	if (user.role === "recruiter") {
		return <Navigate to="/recruiter" />;
	} else if (user.role === "seeker") {
		return <Navigate to="/seeker" />;
	}

	// Fallback for unknown role
	return (
		<div className="text-center py-20">
			<h2 className="text-xl">Unknown user role: {user.role}</h2>
			<p className="mt-4">Please contact support.</p>
		</div>
	);
};

export default Dashboard;
