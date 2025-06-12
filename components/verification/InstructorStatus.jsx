// components/verification/InstructorStatus.jsx
import { GraduationCap, CheckCircle } from "lucide-react";

export default function InstructorStatus({ user }) {
  const isInstructor = user.role === "instructor";

  // Only render for instructors
  if (!isInstructor) {
    return null;
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="mb-4 flex items-center text-lg font-semibold">
        <GraduationCap className="mr-2 h-5 w-5" />
        Instructor Status
      </h3>

      <div className="flex items-start space-x-3">
        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
        <div>
          <p className="text-sm font-medium text-blue-800">
            Verified Instructor
          </p>
          <p className="text-sm text-blue-700">
            As an instructor on our platform, you have full access to course
            creation and purchasing features without additional verification
            requirements.
          </p>
          <div className="mt-3 rounded-md bg-blue-50 p-3">
            <p className="text-xs text-blue-800">
              <strong>Instructor Benefits:</strong>
            </p>
            <ul className="mt-1 space-y-1 text-xs text-blue-700">
              <li>• Create and publish unlimited courses</li>
              <li>• Purchase courses without age verification</li>
              <li>• Access advanced analytics and student insights</li>
              <li>• Priority customer support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
