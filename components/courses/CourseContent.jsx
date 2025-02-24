// components/course/CourseContent.jsx
"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CheckCircle, Loader2 } from "lucide-react";
import Image from "next/image";

export default function CourseContent({
  moduleId,
  lessonId,
  userId,
  courseData,
}) {
  const [lesson, setLesson] = useState(courseData.modules[0]?.lessons[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completing, setCompleting] = useState(false);
  console.log(courseData);
  console.log(lesson);
  //   useEffect(() => {
  //     fetchLessonContent();
  //   }, [lessonId]);

  //   const fetchLessonContent = async () => {
  //     setLoading(true);
  //     setError(null);

  //     try {
  //       const response = await fetch(`/api/lessons/${lessonId}`);
  //       if (!response.ok) throw new Error("Failed to fetch lesson");

  //       const data = await response.json();
  //       setLesson(data);
  //     } catch (err) {
  //       setError("Failed to load lesson content");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  const markAsComplete = async () => {
    setCompleting(true);
    try {
      const response = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to mark lesson as complete");

      // Update local state
      setLesson((prev) => ({
        ...prev,
        completed: true,
      }));
    } catch (err) {
      setError("Failed to mark lesson as complete");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Lesson Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          {!lesson.completed && (
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
          )}
        </div>
        {/* {lesson.title && (
          <p className="text-gray-600">Module: {lesson.title}</p>
        )} */}
      </div>

      {/* Lesson Content */}
      <div className="flex flex-row-reverse justify-end">
        {lesson.content.map((item) => {
          switch (item.content_type) {
            case "TEXT":
              return <p key={item.id}>{item.value}</p>;

            case "IMAGE":
              return (
                <Image
                  key={item.id}
                  src={item.value}
                  alt="Lesson content"
                  width={300}
                  height={200}
                />
              );

            default:
              return <p key={item.id}>{item.value}</p>; // Fallback for unknown types
          }
        })}
      </div>
    </div>
  );
}
