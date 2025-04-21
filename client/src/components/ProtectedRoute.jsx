import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export const ProtectedRoute = ({
	children,
	allowedRoles = [], // Array of allowed roles, empty means any authenticated user
	redirectTo = "/login",
}) => {
	const { user, loadUser } = useAuthStore();
	const navigate = useNavigate();

	useEffect(() => {
		if (!user) {
			loadUser();
		}
	}, [user, loadUser]);

	// If we're still loading, show a spinner
	if (!user) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	// If user is not authenticated, redirect to login
	if (!user) {
		return <Navigate to={redirectTo} />;
	}

	// If roles are specified and user's role isn't in the list, redirect to dashboard
	if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
		return <Navigate to="/dashboard" />;
	}

	// User is authenticated and authorized
	return children;
};
