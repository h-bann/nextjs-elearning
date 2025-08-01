// MobileSidebar.jsx
"use client";

import CourseSidebar from "./CourseSidebar";

export default function MobileSidebar({
  course,
  activeModuleId,
  activeLessonId,
  completedLessons = [],
  onNavigate,
  previewMode = false,
}) {
  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-white md:hidden">
      <CourseSidebar
        course={course}
        activeModuleId={activeModuleId}
        activeLessonId={activeLessonId}
        completedLessons={completedLessons}
        onNavigate={onNavigate}
        previewMode={previewMode}
      />
    </div>
  );
}
