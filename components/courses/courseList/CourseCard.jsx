// components/courses/CourseCard.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function CourseCard({ course }) {
  const [showDescription, setShowDescription] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const handleCourseClick = () => {
    if (!course.isEnrolled) {
      router.push(`/courses/${course.id}/purchase`);
      return;
    }
    router.push(`/courses/${course.id}/learn`);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Course Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={course.image_url || "/api/placeholder/400/300"}
          alt={course.title}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isHovered ? "scale-105" : "scale-100"
          }`}
        />
        {course.isEnrolled && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
            Enrolled
          </div>
        )}
      </div>

      {/* Course Info */}
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 transition-colors duration-300 hover:text-blue-600">
          {course.title}
        </h3>
        <p className="text-gray-600 mb-4">
          Instructor: {course.instructor_name}
        </p>

        {/* Price and Actions */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-blue-600">
            £{course.price}
          </span>
          <button
            onClick={() => setShowDescription(!showDescription)}
            className="text-gray-600 hover:text-gray-800 transition-colors duration-300"
          >
            {showDescription ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Expandable Description with smooth height transition */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            showDescription ? "max-h-48" : "max-h-0"
          }`}
        >
          <p className="text-gray-600 mb-4">{course.description}</p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleCourseClick}
          className={`w-full py-2 px-4 rounded-md font-medium transition-all duration-300 ease-in-out transform hover:scale-[1.02] ${
            course.isEnrolled
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {course.isEnrolled ? "Go to Course" : "Buy Now"}
        </button>
      </div>
    </div>
  );
}
