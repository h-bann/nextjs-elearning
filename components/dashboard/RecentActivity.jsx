// components/dashboard/RecentActivity.jsx
import { Calendar, BookOpen, CheckCircle } from "lucide-react";
import mySQL from "@/lib/database";
import { getUserRecentActivities } from "@/lib/queries";

// Simple helper for relative time
function getRelativeTime(dateString) {
  // If there's no date, return a fallback
  if (!dateString) return "Recent";
  try {
    // Convert dateString to string if it's not already
    const dateStr = String(dateString);

    // For MySQL DATETIME format: YYYY-MM-DD HH:MM:SS
    const parts = dateStr.match(
      /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/,
    );
    let date;
    if (parts) {
      // Parse MySQL datetime format manually
      date = new Date(
        parseInt(parts[1]), // year
        parseInt(parts[2]) - 1, // month (0-indexed in JS)
        parseInt(parts[3]), // day
        parseInt(parts[4]), // hour
        parseInt(parts[5]), // minute
        parseInt(parts[6]), // second
      );
    } else {
      // Fallback to standard parsing
      date = new Date(dateString);
    }
    // Check if we now have a valid date
    if (!date || isNaN(date.getTime())) {
      console.error("Invalid date after parsing:", dateString);
      return "Recent";
    }

    // Calculate time difference
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    // Format based on difference
    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}d ago`;
    return `${Math.floor(diffSec / 2592000)}mo ago`;
  } catch (e) {
    console.error("Date parsing error:", e, "for value:", dateString);
    return "Recent";
  }
}

export default async function RecentActivity({ userId }) {
  // Simple query to get activities
  let activities = [];

  try {
    if (userId) {
      activities = await mySQL(getUserRecentActivities, [userId, userId]);
    }
  } catch (err) {
    console.error("Error fetching activities:", err);
  }

  if (!activities.length) {
    return (
      <div className="rounded-lg bg-white p-4 text-center shadow-sm">
        <p className="text-gray-600">No recent activity found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white shadow-sm">
      <ul className="divide-y divide-gray-100">
        {activities.map((activity, index) => (
          <li key={index} className="p-4">
            <div className="flex items-center">
              <div className="mr-4 rounded-full bg-gray-50 p-2">
                {activity.type === "enrollment" ? (
                  <BookOpen className="h-4 w-4 text-blue-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500">
                  {/* Add a fallback value if timestamp is missing */}
                  {activity.timestamp
                    ? getRelativeTime(activity.timestamp)
                    : "Recent"}
                </p>
              </div>
              {activity.course_id && (
                <a
                  href={`/courses/${activity.course_id}/learn`}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  View
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
