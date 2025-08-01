"use client";

import { useState } from "react";
import { GlobeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PublishCourseButton({
  courseId,
  initialPublishState = false,
}) {
  const [isPublished, setIsPublished] = useState(initialPublishState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleTogglePublish = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/courses/course-editing/${courseId}/publish`,
        {
          method: isPublished ? "DELETE" : "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update course status");
      }

      const result = await response.json();
      setIsPublished(result.published);

      // Refresh the page to show updated state
      router.refresh();
    } catch (err) {
      setError(err.message);
      console.error("Error updating course status:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start">
      <button
        onClick={handleTogglePublish}
        disabled={loading}
        className={`flex items-center rounded-md px-4 py-2 font-medium transition-colors ${
          isPublished
            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            : "bg-green-600 text-white hover:bg-green-700"
        }`}
      >
        {loading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : isPublished ? (
          <EyeOffIcon className="mr-2 h-5 w-5" />
        ) : (
          <GlobeIcon className="mr-2 h-5 w-5" />
        )}
        {isPublished ? "Unpublish Course" : "Publish Course"}
      </button>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <p className="mt-2 text-sm text-gray-600">
        {isPublished
          ? "Your course is live and available to students."
          : "Publish your course when you are ready for students to enroll."}
      </p>
    </div>
  );
}
