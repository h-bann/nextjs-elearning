// components/course/CourseSidebar.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, CheckCircle } from "lucide-react";

export default function CourseSidebar({
  course,
  activeModuleId,
  activeLessonId,
  onNavigate,
}) {
  const router = useRouter();
  const [expandedModules, setExpandedModules] = useState({
    [activeModuleId]: true,
  });

  useEffect(() => {
    // Expand the active module
    if (activeModuleId) {
      setExpandedModules((prev) => ({
        ...prev,
        [activeModuleId]: true,
      }));
    }
  }, [activeModuleId]);

  const handleLessonClick = (moduleId, lessonId) => {
    // Update URL with new lesson
    router.push(
      `/course/${course.id}/learn?moduleId=${moduleId}&lessonId=${lessonId}`
    );
    onNavigate?.();

    // On mobile, hide sidebar after selection
    // if (window.innerWidth < 768) {
    //   document.getElementById("course-sidebar").classList.add("hidden");
    // }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Course Title */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">{course.title}</h2>
      </div>

      {/* Modules List */}
      <div className="flex-1 overflow-y-auto">
        {course.modules.map((module) => (
          <div key={module.id} className="border-b">
            {/* Module Header */}
            <button
              onClick={() =>
                setExpandedModules((prev) => ({
                  ...prev,
                  [module.id]: !prev[module.id],
                }))
              }
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <span className="font-medium">{module.title}</span>
              {expandedModules[module.id] ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {/* Lessons List */}
            {expandedModules[module.id] && (
              <div className="bg-gray-50">
                {module.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonClick(module.id, lesson.id)}
                    className={`w-full p-4 pl-8 flex items-center text-left hover:bg-gray-100 ${
                      lesson.id === activeLessonId
                        ? "bg-blue-50 text-blue-600"
                        : ""
                    }`}
                  >
                    <span className="flex-1">{lesson.title}</span>
                    {lesson.completed && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Footer */}
      <div className="p-4 border-t bg-white">
        <div className="mb-2 flex justify-between text-sm">
          <span>Course Progress</span>
          <span>{course.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{ width: `${course.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
