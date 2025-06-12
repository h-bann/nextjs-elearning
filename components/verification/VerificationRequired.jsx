// components/verification/VerificationRequired.jsx
"use client";

import { Shield, AlertCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VerificationRequired({ course, courseId }) {
  const router = useRouter();

  const handleVerifyAge = () => {
    // Redirect to verification page with course info
    const currentUrl = `/courses/${courseId}/purchase`;
    router.push(
      `/verification/oneid?courseId=${courseId}&returnUrl=${encodeURIComponent(currentUrl)}`,
    );
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="overflow-hidden rounded-lg bg-white shadow-lg">
        {/* Course Header */}
        <div className="border-b bg-gray-50 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
          <p className="mt-1 text-gray-600">Price: £{course.price}</p>
        </div>

        {/* Verification Requirement */}
        <div className="px-6 py-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <Shield className="h-8 w-8 text-yellow-600" />
            </div>

            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Age Verification Required
            </h2>

            <p className="mb-6 leading-relaxed text-gray-600">
              To purchase courses on our platform, you must verify that you are
              over 18 years old. This is a one-time verification process that
              uses OneId's secure age verification service.
            </p>

            {/* Course Preview */}
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <img
                src={course.image_url || "/api/placeholder/400/200"}
                alt={course.title}
                className="mb-3 h-32 w-full rounded-md object-cover"
              />
              <p className="text-left text-sm text-gray-600">
                {course.description}
              </p>
            </div>

            {/* Benefits of Verification */}
            <div className="mb-6 rounded-lg bg-blue-50 p-4 text-left">
              <h3 className="mb-2 flex items-center font-semibold text-blue-900">
                <Shield className="mr-2 h-4 w-4" />
                Why OneId?
              </h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Bank-level security and privacy protection</li>
                <li>• No personal data stored on our servers</li>
                <li>• Quick and easy verification process</li>
                <li>• One-time verification for all future purchases</li>
              </ul>
            </div>

            {/* Warning Notice */}
            <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start">
                <AlertCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
                <div className="text-left">
                  <h4 className="text-sm font-medium text-amber-800">
                    Age Restriction Notice
                  </h4>
                  <p className="mt-1 text-sm text-amber-700">
                    This content is restricted to users over 18 years of age.
                    Age verification is required by law for adult content
                    purchases.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleVerifyAge}
                className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Shield className="mr-2 h-5 w-5" />
                Verify Age with OneId
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>

              <button
                onClick={() => router.back()}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Back to Course Details
              </button>
            </div>

            {/* Privacy Notice */}
            <p className="mt-6 text-xs text-gray-500">
              Your privacy is protected. OneId verification is handled securely
              and no personal identification details are shared with us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
