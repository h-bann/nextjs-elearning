// components/courses/courseContent/PreviewNavigation.jsx
"use client";

import { ArrowLeft, Edit, Settings, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PreviewNavigation({
  courseId,
  courseTitle,
  isPublished = false,
}) {
  const router = useRouter();

  return (
    <div className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Left side - Back button and course info */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push(`/dashboard/courses/${courseId}/edit`)}
              className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Editor</span>
            </button>

            <div className="hidden sm:block">
              <span className="text-sm text-gray-500">Previewing:</span>
              <span className="ml-2 font-medium text-gray-900">
                {courseTitle}
              </span>
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                router.push(`/dashboard/courses/${courseId}/settings`)
              }
              className="flex items-center space-x-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            <button
              onClick={() => router.push(`/dashboard/courses/${courseId}/edit`)}
              className="flex items-center space-x-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Edit Course</span>
            </button>

            {isPublished && (
              <button
                onClick={() => router.push(`/courses/${courseId}/learn`)}
                className="flex items-center space-x-2 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Live View</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile course title */}
        <div className="block pb-3 sm:hidden">
          <div className="text-sm text-gray-500">Previewing:</div>
          <div className="font-medium text-gray-900">{courseTitle}</div>
        </div>
      </div>
    </div>
  );
}
