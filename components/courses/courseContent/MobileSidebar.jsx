"use client";

import CourseSidebar from "./CourseSidebar";
import { useEffect } from "react";

export default function MobileSidebar({
  course,
  activeModuleId,
  activeLessonId,
  completedLessons = [],
  onNavigate,
}) {
  return (
    <div className="md:hidden fixed inset-0 z-40 bg-white overflow-y-auto">
      <CourseSidebar
        course={course}
        activeModuleId={activeModuleId}
        activeLessonId={activeLessonId}
        completedLessons={completedLessons}
        onNavigate={onNavigate}
      />
    </div>
  );
}
