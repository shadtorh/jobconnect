import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const FormInput = ({
	label,
	type,
	name,
	value,
	onChange,
	placeholder,
	required,
}) => {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<div>
			<label htmlFor={name} className="block text-sm font-medium text-gray-700">
				{label}
			</label>
			<div className="relative">
				<input
					type={type === "password" && showPassword ? "text" : type}
					id={name}
					name={name}
					value={value}
					onChange={onChange}
					className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
					placeholder={placeholder}
					required={required}
				/>
				{/* Toggle Password Visibility */}
				{type === "password" && (
					<span
						className="absolute inset-y-0 right-3 flex items-center text-gray-400 cursor-pointer"
						onClick={() => setShowPassword(!showPassword)}
					>
						{showPassword ? <FaEyeSlash /> : <FaEye />}
					</span>
				)}
			</div>
		</div>
	);
};

export default FormInput;
