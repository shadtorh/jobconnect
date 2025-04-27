import React, { useState, useEffect } from "react";

import { useAuthStore } from "../store/useAuthStore";
import { Loading } from "../components";

const ProfileSettings = () => {
	const { user, isLoading, updateProfile } = useAuthStore();

	// Keep initial state for UI rendering only
	const [formData, setFormData] = useState({
		first_name: "",
		last_name: "",
		email: "",
	});

	useEffect(() => {
		if (user) {
			// Just log instead of setting state
			console.log("User data loaded:", {
				first_name: user.first_name || "",
				last_name: user.last_name || "",
				email: user.email || "",
			});

			// Still need to set initial state for UI rendering
			setFormData({
				first_name: user.first_name || "",
				last_name: user.last_name || "",
				email: user.email || "",
			});
		}
	}, [user]);

	const handleChange = (e) => {
		// No state update needed
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		await updateProfile(formData);
	};

	if (isLoading) {
		return <Loading />;
	}

	return (
		<div className="min-h-screen bg-gray-50 py-10">
			{/* Main Content - without sidebar */}
			<div className="max-w-2xl mx-auto p-6">
				<div className="mb-6">
					<h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
					<p className="text-sm text-gray-500">Update your account details</p>
				</div>

				{/* Profile Settings Form */}
				<div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
					<form onSubmit={handleSubmit}>
						{/* Profile settings */}
						<div className="flex flex-col items-center justify-center mb-8">
							<div className="relative mb-4">
								<div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
									<div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-5xl font-bold">
										{formData.first_name
											? formData.first_name[0].toUpperCase()
											: "U"}
									</div>
								</div>
							</div>
						</div>

						{/* Name Fields */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
							<div>
								<label
									className="block text-sm font-medium text-gray-700 mb-1"
									htmlFor="first_name"
								>
									First Name
								</label>
								<input
									type="text"
									id="first_name"
									name="first_name"
									value={formData.first_name}
									onChange={handleChange}
									className="w-full border border-gray-200 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
									placeholder="Enter first name"
								/>
							</div>
							<div>
								<label
									className="block text-sm font-medium text-gray-700 mb-1"
									htmlFor="last_name"
								>
									Last Name
								</label>
								<input
									type="text"
									id="last_name"
									name="last_name"
									value={formData.last_name}
									onChange={handleChange}
									className="w-full border border-gray-200 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
									placeholder="Enter last name"
								/>
							</div>
						</div>

						{/* Email Field */}
						<div className="mb-8">
							<label
								className="block text-sm font-medium text-gray-700 mb-1"
								htmlFor="email"
							>
								Email Address
							</label>
							<input
								type="email"
								id="email"
								name="email"
								value={formData.email}
								disabled
								className="w-full border border-gray-200 bg-gray-50 rounded-md px-4 py-2 text-gray-500"
							/>
							<p className="text-xs text-gray-500 mt-1">Email used for login</p>
						</div>

						{/* Submit button */}
						<button
							type="submit"
							className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
						>
							Update Profile
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default ProfileSettings;
