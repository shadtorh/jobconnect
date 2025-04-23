import client from "../db/init.js";

// GET /api/notifications
export const getRecruiterNotifications = async (req, res) => {
	try {
		const recruiter_id = req.user.userId;

		const { rows } = await client.query(
			`SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
			[recruiter_id]
		);

		res.json({ success: true, notifications: rows });
	} catch (err) {
		console.error(err);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const markNotificationAsRead = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.userId;

		// First verify the notification belongs to this user
		const notificationCheck = await client.query(
			"SELECT * FROM notifications WHERE id = $1 AND user_id = $2",
			[id, userId]
		);

		if (notificationCheck.rowCount === 0) {
			return res.status(404).json({
				success: false,
				message: "Notification not found",
			});
		}

		await client.query(
			"UPDATE notifications SET is_read = true WHERE id = $1",
			[id]
		);

		res.status(200).json({
			success: true,
			message: "Notification marked as read",
		});
	} catch (error) {
		console.error("Error marking notification as read:", error);
		res.status(500).json({
			success: false,
			message: "Failed to mark notification as read",
			error: error.message,
		});
	}
};

export const markAllNotificationsAsRead = async (req, res) => {
	try {
		const userId = req.user.userId;

		await client.query(
			"UPDATE notifications SET is_read = true WHERE user_id = $1",
			[userId]
		);

		res.status(200).json({
			success: true,
			message: "All notifications marked as read",
		});
	} catch (error) {
		console.error("Error marking all notifications as read:", error);
		res.status(500).json({
			success: false,
			message: "Failed to mark all notifications as read",
			error: error.message,
		});
	}
};

export const getUnreadNotificationsCount = async (req, res) => {
	try {
		const userId = req.user.userId;

		const result = await client.query(
			"SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false",
			[userId]
		);

		const count = parseInt(result.rows[0].count);

		res.status(200).json({
			success: true,
			count,
		});
	} catch (error) {
		console.error("Error fetching unread notifications count:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch unread notifications count",
			error: error.message,
		});
	}
};

export const getSeekerNotifications = async (req, res) => {
	try {
		const seeker_id = req.user.userId;

		const query = `
      SELECT * FROM notifications 
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

		const { rows } = await client.query(query, [seeker_id]);

		return res.status(200).json({
			success: true,
			notifications: rows,
		});
	} catch (error) {
		console.error("Error fetching notifications:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to fetch notifications",
			error: error.message,
		});
	}
};
