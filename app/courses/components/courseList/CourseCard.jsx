"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, CreditCard, BookOpen } from "lucide-react";

export default function CourseCard({ course }) {
  const [showDescription, setShowDescription] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleCourseClick = () => {
    if (!course.isEnrolled) {
      // Redirect to purchase page
      router.push(`/courses/${course.id}/purchase`);
      return;
    }

    // User already owns the course, go to learning page
    router.push(`/courses/${course.id}/learn`);
  };

  const handlePreview = (e) => {
    e.stopPropagation();
    // If you have a preview functionality, implement it here
    router.push(`/courses/${course.id}/preview`);
  };

  return (
    <div
      className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 ease-in-out hover:shadow-xl sm:w-80"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCourseClick}
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

        {/* Status Badge */}
        {course.isEnrolled && (
          <div className="absolute right-2 top-2 rounded-full bg-green-500 px-3 py-1 text-sm font-medium text-white shadow-md">
            Enrolled
          </div>
        )}
      </div>

      {/* Course Info */}
      <div className="p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-2 text-xl font-semibold transition-colors duration-300 hover:text-blue-600">
          {course.title}
        </h3>
        <p className="mb-4 text-gray-600">
          Instructor: {course.instructor_name}
        </p>

        {/* Price and Description Toggle */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600">
            £{parseFloat(course.price).toFixed(2)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDescription(!showDescription);
            }}
            className="text-gray-600 transition-colors duration-300 hover:text-gray-800"
          >
            {showDescription ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Expandable Description */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            showDescription ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <p className="mb-4 text-sm text-gray-600">{course.description}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleCourseClick}
            className={`flex w-full transform items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700`}
          >
            {course.isEnrolled ? (
              <>
                <BookOpen className="mr-2 h-4 w-4" />
                Continue Learning
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Purchase Course
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
