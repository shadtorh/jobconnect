import React, { useEffect } from "react";
import { useNotificationStore } from "../../store/useNotificationStore";
import { FaEnvelope, FaInbox } from "react-icons/fa";

const MessagesTab = () => {
	const { getSeekerNotifications, notifications } = useNotificationStore();

	useEffect(() => {
		getSeekerNotifications();
	}, [getSeekerNotifications]);

	return (
		<div className="bg-white rounded-lg shadow">
			{/* Simple Header */}
			<div className="border-b border-gray-200 p-4">
				<h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
					<FaInbox className="text-blue-600" />
					Messages
				</h1>
			</div>

			{/* Message List */}
			<div className="divide-y divide-gray-200">
				{notifications.length > 0 ? (
					notifications.map((notification) => (
						<div
							key={notification.id}
							className="p-4 hover:bg-gray-50 transition-colors"
						>
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
									<FaEnvelope className="text-blue-500" />
								</div>

								<div className="flex-grow min-w-0">
									<div className="flex justify-between items-start">
										<h3 className="text-sm font-medium text-gray-900">
											{notification.title || "New Notification"}
										</h3>
										<span className="text-xs text-gray-500">
											{notification.created_at
												? new Date(notification.created_at).toLocaleDateString()
												: "Recently"}
										</span>
									</div>

									<p className="mt-1 text-sm text-gray-700">
										{notification.message}
									</p>
								</div>
							</div>
						</div>
					))
				) : (
					<div className="py-8 text-center">
						<FaInbox className="h-8 w-8 text-gray-400 mx-auto mb-2" />
						<p className="text-gray-500">No messages yet</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default MessagesTab;
