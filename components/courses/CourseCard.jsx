"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function CourseCard({ course }) {
  const [showDescription, setShowDescription] = useState(false);
  const router = useRouter();

  const handleBuy = () => {
    // If user is enrolled, go to course page
    if (course.isEnrolled) {
      router.push(`/dashboard/courses/${course.id}`);
      return;
    }
    // Otherwise, go to purchase page
    router.push(`/courses/${course.id}/purchase`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Course Image */}
      <div className="relative h-48">
        <img
          src={course.image_url || "/api/placeholder/400/300"}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        {course.isEnrolled && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
            Enrolled
          </div>
        )}
      </div>

      {/* Course Info */}
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
        <p className="text-gray-600 mb-4">
          Instructor: {course.instructor_name}
        </p>

        {/* Price and Actions */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-blue-600">
            ${course.price}
          </span>
          <button
            onClick={() => setShowDescription(!showDescription)}
            className="text-gray-600 hover:text-gray-800"
          >
            {showDescription ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Expandable Description */}
        {showDescription && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">About this course:</h4>
            <p className="text-gray-600">{course.description}</p>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleBuy}
          className={`w-full py-2 px-4 rounded-md font-medium ${
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
