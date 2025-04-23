import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Loading } from "../components";

// Redirects authenticated users away from login/signup
export const withPublicGuard = (Component) => {
	const PublicRoute = (props) => {
		const { user } = useAuthStore();

		if (user) {
			// Determine where to redirect based on role
			return <Navigate to="/dashboard" replace />;
		}

		return <Component {...props} />;
	};

	return PublicRoute;
};

// Protects routes that require authentication
export const withAuthGuard = (Component) => {
	const PrivateRoute = (props) => {
		const { user, isLoading } = useAuthStore();
		const location = useLocation();

		if (isLoading) {
			return <Loading />;
		}

		if (!user) {
			// Save the attempted location for redirect after login
			return <Navigate to="/login" state={{ from: location }} replace />;
		}

		return <Component {...props} />;
	};

	return PrivateRoute;
};

// Protects routes for specific roles
export const withRoleGuard = (Component, allowedRoles) => {
	const RoleRoute = (props) => {
		const { user, isLoading } = useAuthStore();

		if (isLoading) {
			return <Loading />;
		}

		if (!user) {
			return <Navigate to="/login" replace />;
		}

		if (!allowedRoles.includes(user.role)) {
			return <Navigate to="/dashboard" replace />;
		}

		return <Component {...props} />;
	};

	return RoleRoute;
};
