"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { completeLessonAction } from "@/lib/serverActions";

export default function CompleteLessonButton({ lessonId }) {
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(null);

  const markAsComplete = async () => {
    setCompleting(true);
    try {
      // Call the server action directly
      const result = await completeLessonAction(lessonId);

      if (result.error) {
        throw new Error(result.error);
      }

      setCompleted(true);
    } catch (err) {
      setError("Failed to mark lesson as complete");
      console.error(err);
    } finally {
      setCompleting(false);
    }
  };

  if (completed) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
        <CheckCircle className="w-4 h-4" />
        Completed
      </div>
    );
  }

  return (
    <button
      onClick={markAsComplete}
      disabled={completing}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
    >
      {completing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <CheckCircle className="w-4 h-4" />
      )}
      Mark Complete
    </button>
  );
}
