"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import MobileSidebar from "./MobileSidebar";

export default function MobileHeader({
  title,
  course,
  activeModuleId,
  activeLessonId,
  completedLessons = [],
  previewMode = false,
  isInstructor = false,
  isPublished = false,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const showPreviewLabel = previewMode || (isInstructor && !isPublished);

  return (
    <>
      <div className="flex items-center justify-between border-b bg-white px-4 py-3 md:hidden">
        <div className="flex flex-col">
          <h1 className="truncate text-lg font-semibold">{title}</h1>
          {showPreviewLabel && (
            <span className="inline-block rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
              Preview Mode
            </span>
          )}
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="rounded-lg p-2 hover:bg-gray-100"
        >
          {isSidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {isSidebarOpen && (
        <MobileSidebar
          course={course}
          activeModuleId={activeModuleId}
          activeLessonId={activeLessonId}
          completedLessons={completedLessons}
          onNavigate={() => setIsSidebarOpen(false)}
          previewMode={showPreviewLabel}
        />
      )}
    </>
  );
}
