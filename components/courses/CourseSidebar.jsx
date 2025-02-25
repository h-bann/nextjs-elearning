"use client";
import Link from "next/link";
import { ChevronDown, ChevronUp, CheckCircle, Lock } from "lucide-react";
import { useState, useEffect } from "react";

export default function CourseSidebar({
  course,
  activeModuleId,
  activeLessonId,
  completedLessons = [], // Add this prop
  onNavigate,
}) {
  const [expandedModules, setExpandedModules] = useState({
    [activeModuleId]: true,
  });

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

  // Function to check if a lesson is available
  const isLessonAvailable = (moduleIndex, lessonIndex) => {
    // First lesson is always available
    if (moduleIndex === 0 && lessonIndex === 0) return true;

    // Get the previous lesson
    let prevLesson;
    if (lessonIndex > 0) {
      // Previous lesson in same module
      prevLesson = course.modules[moduleIndex].lessons[lessonIndex - 1];
    } else if (moduleIndex > 0) {
      // Last lesson of previous module
      const prevModule = course.modules[moduleIndex - 1];
      prevLesson = prevModule.lessons[prevModule.lessons.length - 1];
    }

    // Check if previous lesson is completed
    return prevLesson ? completedLessons.includes(prevLesson.id) : true;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Course Title */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">{course.title}</h2>
      </div>

      {/* Modules List */}
      <div className="flex-1 overflow-y-auto">
        {course.modules.map((module, moduleIndex) => (
          <div key={module.id} className="border-b">
            <div
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
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
                  const isAvailable = isLessonAvailable(
                    moduleIndex,
                    lessonIndex
                  );
                  const isCompleted = completedLessons.includes(lesson.id);

                  return isAvailable ? (
                    <Link
                      key={lesson.id}
                      href={`/courses/${course.id}/learn?moduleId=${module.id}&lessonId=${lesson.id}`}
                      className={`block w-full p-4 pl-8 hover:bg-gray-100 ${
                        lesson.id == activeLessonId
                          ? "bg-blue-50 text-blue-600"
                          : ""
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="flex-1">{lesson.title}</span>
                        {isCompleted && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div
                      key={lesson.id}
                      className="block w-full p-4 pl-8 text-gray-400 cursor-not-allowed"
                    >
                      <div className="flex items-center">
                        <span className="flex-1">{lesson.title}</span>
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

      {/* Progress Footer */}
      <div className="p-4 border-t bg-white">
        <div className="mb-2 flex justify-between text-sm">
          <span>Course Progress</span>
          <span>
            {Math.round(
              (completedLessons.length /
                course.modules.reduce(
                  (total, module) => total + module.lessons.length,
                  0
                )) *
                100
            ) || 0}
            %
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{
              width: `${
                Math.round(
                  (completedLessons.length /
                    course.modules.reduce(
                      (total, module) => total + module.lessons.length,
                      0
                    )) *
                    100
                ) || 0
              }%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
