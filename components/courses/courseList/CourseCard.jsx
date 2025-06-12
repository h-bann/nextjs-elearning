// components/courses/courseList/CourseCard.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Shield } from "lucide-react";

export default function CourseCard({ course, userVerified = false }) {
  const [showDescription, setShowDescription] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleCourseClick = async () => {
    if (!course.isEnrolled) {
      // Check if user is logged in first
      try {
        const response = await fetch("/api/auth/check");
        const data = await response.json();

        if (!data.user) {
          // Not logged in, redirect to signup
          router.push(
            `/auth/signup?redirect=${encodeURIComponent(`/courses/${course.id}/purchase`)}`,
          );
          return;
        }

        // User is logged in, go to purchase page (which will handle verification)
        router.push(`/courses/${course.id}/purchase`);
      } catch (error) {
        console.error("Error checking auth status:", error);
        router.push(
          `/auth/signup?redirect=${encodeURIComponent(`/courses/${course.id}/purchase`)}`,
        );
      }
      return;
    }

    router.push(`/courses/${course.id}/learn`);
  };

  return (
    <div
      className="overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 ease-in-out hover:shadow-xl sm:w-80"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Course Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={course.image_url || "/api/placeholder/400/300"}
          alt={course.title}
          className={`h-full w-full object-cover transition-transform duration-300 ${
            isHovered ? "scale-105" : "scale-100"
          }`}
        />
        {course.isEnrolled && (
          <div className="absolute right-2 top-2 rounded bg-green-500 px-2 py-1 text-sm text-white">
            Enrolled
          </div>
        )}
        {!course.isEnrolled && !userVerified && (
          <div className="absolute left-2 top-2 flex items-center rounded bg-amber-500 px-2 py-1 text-xs text-white">
            <Shield className="mr-1 h-3 w-3" />
            18+ Verification Required
          </div>
        )}
      </div>

      {/* Course Info */}
      <div className="p-6">
        <h3 className="mb-2 text-xl font-semibold transition-colors duration-300 hover:text-blue-600">
          {course.title}
        </h3>
        <p className="mb-4 text-gray-600">
          Instructor: {course.instructor_name}
        </p>

        {/* Price and Actions */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600">
            £{course.price}
          </span>
          <button
            onClick={() => setShowDescription(!showDescription)}
            className="text-gray-600 transition-colors duration-300 hover:text-gray-800"
          >
            {showDescription ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Expandable Description with smooth height transition */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            showDescription ? "max-h-48" : "max-h-0"
          }`}
        >
          <p className="mb-4 text-gray-600">{course.description}</p>
        </div>

        {/* Age Verification Notice */}
        {!course.isEnrolled && !userVerified && (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-start">
              <Shield className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
              <div>
                <p className="text-xs font-medium text-amber-800">
                  Age Verification Required
                </p>
                <p className="text-xs text-amber-700">
                  You'll need to verify you're 18+ before purchasing
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleCourseClick}
          className={`w-full transform rounded-md px-4 py-2 font-medium transition-colors ${
            course.isEnrolled
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-accent-light text-white hover:bg-accent hover:bg-blue-700"
          }`}
        >
          {course.isEnrolled ? "Go to Course" : "Buy Now"}
        </button>
      </div>
    </div>
  );
}
