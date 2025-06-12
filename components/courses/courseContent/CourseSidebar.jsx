"use client";
import Link from "next/link";
import { ChevronDown, ChevronUp, CheckCircle, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { useCourseProgress } from "@/lib/courseProgressContext";

export default function CourseSidebar({
  course,
  activeModuleId,
  activeLessonId,
  onNavigate,
  previewMode = false,
  isInstructor = false,
  isPublished = false,
}) {
  const showPreviewLabel = previewMode || (isInstructor && !isPublished);

  const [expandedModules, setExpandedModules] = useState({
    [activeModuleId]: true,
  });

  const { completedLessons, isLessonCompleted, isLessonAvailable } =
    useCourseProgress();

  // Automatically expand the active module
  useEffect(() => {
    if (activeModuleId) {
      setExpandedModules((prev) => ({
        ...prev,
        [activeModuleId]: true,
      }));
    }
  }, [activeModuleId]);

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  // Calculate total lessons in the course
  const totalLessons = course.modules.reduce(
    (total, module) => total + module.lessons.length,
    0,
  );

  // Calculate completion percentage
  const completionPercentage =
    Math.round((completedLessons.length / totalLessons) * 100) || 0;

  // Base path for links - either learn or preview depending on mode
  const basePath = previewMode
    ? `/courses/${course.id}/preview`
    : `/courses/${course.id}/learn`;

  return (
    <div className="flex h-full flex-col">
      {/* Course Title */}
      <div className="border-b px-4 py-4">
        <h2 className="text-lg font-semibold">{course.title}</h2>
        {showPreviewLabel && (
          <div className="mt-1 inline-block rounded-full bg-yellow-100 px-2 py-1 text-sm text-yellow-800">
            Preview Mode
          </div>
        )}
      </div>

      {/* Modules List - Make this scroll independently */}
      <div className="flex-1 overflow-y-auto">
        {course.modules.map((module, moduleIndex) => (
          <div key={module.id} className="border-b">
            <div
              className="flex w-full cursor-pointer items-center justify-between p-3 hover:bg-gray-50"
              onClick={() => toggleModule(module.id)}
            >
              <span className="font-medium">{module.title}</span>
              {expandedModules[module.id] ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>

            {expandedModules[module.id] && (
              <div className="bg-gray-50">
                {module.lessons.map((lesson, lessonIndex) => {
                  // Explicitly convert IDs to numbers for comparison
                  const isCompleted = isLessonCompleted(Number(lesson.id));
                  // In preview mode, all lessons are available
                  const isAvailable = previewMode
                    ? true
                    : isLessonAvailable(moduleIndex, lessonIndex);
                  const isActive = Number(lesson.id) === Number(activeLessonId);

                  return isAvailable ? (
                    <Link
                      key={lesson.id}
                      href={`${basePath}?moduleId=${module.id}&lessonId=${lesson.id}`}
                      className={`block w-full p-3 pl-8 hover:bg-gray-100 ${
                        isActive ? "bg-blue-50 text-blue-600" : ""
                      }`}
                      onClick={onNavigate}
                    >
                      <div className="flex items-center">
                        <span className="flex-1 text-sm">{lesson.title}</span>
                        {!previewMode && isCompleted && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div
                      key={lesson.id}
                      className="block w-full cursor-not-allowed p-3 pl-8 text-gray-400"
                    >
                      <div className="flex items-center">
                        <span className="flex-1 text-sm">{lesson.title}</span>
                        <Lock className="h-4 w-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Footer - Fixed at bottom, hide in preview mode */}
      {!previewMode && (
        <div className="shrink-0 border-t bg-white px-4 py-3">
          <div className="mb-2 flex justify-between text-sm">
            <span>Course Progress</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-green-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
