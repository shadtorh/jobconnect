const StatusBadge = ({ status }) => {
	const getStatusStyles = () => {
		switch (status) {
			case "approved":
				return "bg-green-100 text-green-800";
			case "rejected":
				return "bg-red-100 text-red-800";
			case "pending":
			default:
				return "bg-blue-100 text-blue-600";
		}
	};

	return (
		<span
			className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles()}`}
		>
			{status.charAt(0).toUpperCase() + status.slice(1)}
		</span>
	);
};

export default StatusBadge;
