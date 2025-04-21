import React, { useState } from "react";
import { Link } from "react-router-dom";
import FormInput from "../components/FormInput";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const Login = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const { login, isLoading } = useAuthStore();
	const navigate = useNavigate();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		// Call the login function from the store

		const result = await login(formData);
		if (result) {
			navigate("/");
		}
	};

	return (
		<div className="flex justify-center items-center min-h-screen bg-gray-50">
			<div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
				{/* Title */}
				<h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
					Welcome Back
				</h2>
				<p className="text-sm text-gray-600 text-center mb-6">
					Login to your account
				</p>

				{/* Form */}
				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Email Address */}
					<FormInput
						label="Email address"
						type="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						placeholder="Email address"
						required
					/>

					{/* Password */}
					<FormInput
						label="Password"
						type="password"
						name="password"
						value={formData.password}
						onChange={handleChange}
						placeholder="Password"
						required
					/>

					{/* Submit Button */}
					<div>
						<button
							type="submit"
							disabled={isLoading}
							className={`w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition cursor-pointer ${
								isLoading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"
							}`}
						>
							{isLoading ? "Logging in..." : "Login"}
						</button>
					</div>
				</form>

				{/* Signup Link */}
				<p className="text-sm text-gray-600 text-center mt-4">
					Don't have an account?{" "}
					<Link to="/signup" className="text-blue-600 hover:underline">
						Sign up
					</Link>
				</p>
			</div>
		</div>
	);
};

export default Login;
