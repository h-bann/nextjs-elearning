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
}) {
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
    0
  );

  // Calculate completion percentage
  const completionPercentage =
    Math.round((completedLessons.length / totalLessons) * 100) || 0;

  return (
    <div className="h-full flex flex-col">
      {/* Course Title */}
      <div className="py-4 px-4 border-b">
        <h2 className="text-lg font-semibold">{course.title}</h2>
      </div>

      {/* Modules List - Make this scroll independently */}
      <div className="flex-1 overflow-y-auto">
        {course.modules.map((module, moduleIndex) => (
          <div key={module.id} className="border-b">
            <div
              className="w-full p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
              onClick={() => toggleModule(module.id)}
            >
              <span className="font-medium">{module.title}</span>
              {expandedModules[module.id] ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>

            {expandedModules[module.id] && (
              <div className="bg-gray-50">
                {module.lessons.map((lesson, lessonIndex) => {
                  // Explicitly convert IDs to numbers for comparison
                  const isCompleted = isLessonCompleted(Number(lesson.id));
                  const isAvailable = isLessonAvailable(
                    moduleIndex,
                    lessonIndex
                  );
                  const isActive = Number(lesson.id) === Number(activeLessonId);

                  return isAvailable ? (
                    <Link
                      key={lesson.id}
                      href={`/courses/${course.id}/learn?moduleId=${module.id}&lessonId=${lesson.id}`}
                      className={`block w-full p-3 pl-8 hover:bg-gray-100 ${
                        isActive ? "bg-blue-50 text-blue-600" : ""
                      }`}
                      onClick={onNavigate}
                    >
                      <div className="flex items-center">
                        <span className="flex-1 text-sm">{lesson.title}</span>
                        {isCompleted && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div
                      key={lesson.id}
                      className="block w-full p-3 pl-8 text-gray-400 cursor-not-allowed"
                    >
                      <div className="flex items-center">
                        <span className="flex-1 text-sm">{lesson.title}</span>
                        <Lock className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Footer - Fixed at bottom */}
      <div className="py-3 px-4 border-t bg-white shrink-0">
        <div className="mb-2 flex justify-between text-sm">
          <span>Course Progress</span>
          <span>{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
