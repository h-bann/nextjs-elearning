"use client";
import Link from "next/link";
import { ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function CourseSidebar({
  course,
  activeModuleId,
  activeLessonId,
}) {
  console.log(Number(activeLessonId));
  console.log(course.modules[0].lessons[0].id);
  // Use client-side state to track expanded modules
  const [expandedModules, setExpandedModules] = useState({
    [activeModuleId]: true, // Start with active module expanded
  });
  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
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

            {/* Lessons List */}
            {expandedModules[module.id] && (
              <div className="bg-gray-50">
                {module.lessons.map((lesson) => (
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
                      {lesson.completed && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </Link>
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
          <span>{course.progress || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{ width: `${course.progress || 0}%` }}
          />
        </div>
      </div>
    </div>
  );
}
