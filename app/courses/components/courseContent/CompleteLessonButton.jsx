"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { completeLessonAction } from "@/lib/serverActions";
import { useRouter } from "next/navigation";
import { useCourseProgress } from "@/lib/courseProgressContext";

export default function CompleteLessonButton({ lessonId, isCompleted }) {
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);
  const [error, setError] = useState(null);
  const router = useRouter();

  const { addCompletedLesson } = useCourseProgress();

  // Update local state if the server-side isCompleted changes
  useEffect(() => {
    setCompleted(isCompleted);
  }, [isCompleted]);

  const markAsComplete = async () => {
    setCompleting(true);
    try {
      console.log(`Attempting to mark lesson ${lessonId} as complete...`);

      // Call the server action directly
      const result = await completeLessonAction(lessonId);
      console.log("Server action result:", result);

      if (result.error) {
        throw new Error(result.error);
      }

      setCompleted(true);
      addCompletedLesson(Number(lessonId));

      // Force a refresh of the page to update context and all components
      // Use a slight delay to ensure DB operations complete
      // setTimeout(() => {
      //   console.log("Refreshing page to update lesson progress...");
      // }, 200);
      router.refresh();
      // setTimeout(() => {
      //   console.log("Hard reloading page to update lesson progress...");
      //   // Force a complete page reload - this is the most direct approach
      //   window.location.reload();
      // }, 500);
    } catch (err) {
      setError("Failed to mark lesson as complete");
      console.error("Error marking lesson complete:", err);
    } finally {
      setCompleting(false);
    }
  };

  if (completed) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-green-800">
        <CheckCircle className="h-4 w-4" />
        Completed
      </div>
    );
  }

  return (
    <button
      onClick={markAsComplete}
      disabled={completing}
      className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
    >
      {completing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle className="h-4 w-4" />
      )}
      Mark Complete
    </button>
  );
}
