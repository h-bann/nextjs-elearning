"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import MobileSidebar from "./MobileSidebar";

export default function MobileHeader({
  title,
  course,
  activeModuleId,
  activeLessonId,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <div className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold truncate">{title}</h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {isSidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {isSidebarOpen && (
        <MobileSidebar
          course={course}
          activeModuleId={activeModuleId}
          activeLessonId={activeLessonId}
          onNavigate={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
}
