"use client";

import CourseSidebar from "./CourseSidebar";

export default function MobileSidebar({
  course,
  activeModuleId,
  activeLessonId,
  onNavigate,
}) {
  return (
    <div className="md:hidden fixed inset-0 z-40 bg-white overflow-y-auto">
      <CourseSidebar
        course={course}
        activeModuleId={activeModuleId}
        activeLessonId={activeLessonId}
        onNavigate={onNavigate}
      />
    </div>
  );
}
