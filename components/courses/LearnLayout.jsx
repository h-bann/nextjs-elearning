// components/course/LearnLayout.jsx
"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import CourseSidebar from "./CourseSidebar";
import CourseContent from "./CourseContent";

export default function LearnLayout({
  courseData,
  initialModuleId,
  initialLessonId,
  userId,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold truncate">{courseData.title}</h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`
          ${isSidebarOpen ? "block" : "hidden"} 
          md:block w-full md:w-80 bg-white border-r overflow-y-auto
          fixed md:relative inset-0 z-40
        `}
      >
        <CourseSidebar
          course={courseData}
          activeModuleId={initialModuleId}
          activeLessonId={initialLessonId}
          onNavigate={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <CourseContent
          courseData={courseData}
          moduleId={initialModuleId}
          lessonId={initialLessonId}
          userId={userId}
        />
      </main>
    </div>
  );
}
