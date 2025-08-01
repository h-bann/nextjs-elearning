// components/courses/courseContent/InstructorViewBanner.jsx
import { InfoIcon } from "lucide-react";

export default function InstructorViewBanner({
  isPreviewMode = false,
  isPublished = false,
}) {
  let message = "You are viewing this course as the instructor.";

  if (isPreviewMode) {
    message += " This is preview mode.";
  } else if (!isPublished) {
    message += " This course is not published yet.";
  }

  return (
    <div className="h-8 w-full border-b border-blue-100 bg-blue-50 text-blue-700">
      <div className="container mx-auto flex h-full items-center justify-center">
        <InfoIcon className="mr-2 h-4 w-4 flex-shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
