import React, { useState } from "react";
import { Link } from "react-router-dom";
import FormInput from "../components/FormInput";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const Signup = () => {
	const [formData, setFormData] = useState({
		first_name: "",
		last_name: "",
		email: "",
		password: "",
		role: "",
	});

	const { signup, isLoading } = useAuthStore();

	const navigate = useNavigate();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const result = await signup(formData);
		if (result) {
			navigate("/login");
		} else {
			console.error("Signup failed");
		}
	};

	return (
		<div className="flex justify-center items-center min-h-screen bg-gray-50">
			<div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
				{/* Title */}
				<h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
					Create Account
				</h2>
				<p className="text-sm text-gray-600 text-center mb-6">
					Join our community today
				</p>

				{/* Form */}
				<form onSubmit={handleSubmit} className="space-y-4">
					{/* First Name and Last Name */}
					<div className="flex gap-4">
						<div className="flex-1">
							<FormInput
								label="First Name"
								type="text"
								name="first_name"
								value={formData.first_name}
								onChange={handleChange}
								placeholder="First Name"
								required
							/>
						</div>
						<div className="flex-1">
							<FormInput
								label="Last Name"
								type="text"
								name="last_name"
								value={formData.last_name}
								onChange={handleChange}
								placeholder="Last Name"
								required
							/>
						</div>
					</div>

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

					{/* Role Selection */}
					<div>
						<label
							htmlFor="role"
							className="block text-sm font-medium text-gray-700"
						>
							I am a
						</label>
						<select
							id="role"
							name="role"
							value={formData.role}
							onChange={handleChange}
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
							required
						>
							<option value="">Select your role</option>
							<option value="seeker">Job Seeker</option>
							<option value="recruiter">Recruiter</option>
						</select>
					</div>

					{/* Submit Button */}
					<div>
						<button
							type="submit"
							disabled={isLoading}
							className={`w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition ${
								isLoading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"
							}`}
						>
							{isLoading ? "Signing Up..." : "Sign Up"}
						</button>
					</div>
				</form>

				{/* Sign In Link */}
				<p className="text-sm text-gray-600 text-center mt-4">
					Already have an account?{" "}
					<Link to="/login" className="text-blue-600 hover:underline">
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
};

export default Signup;
