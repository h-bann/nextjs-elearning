// components/courses/CourseCardSkeleton.jsx
export default function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="h-48 bg-gray-200" />

      {/* Content placeholders */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded w-3/4" />

        {/* Instructor */}
        <div className="h-4 bg-gray-200 rounded w-1/2" />

        {/* Price */}
        <div className="h-8 bg-gray-200 rounded w-1/4" />

        {/* Button */}
        <div className="h-10 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
