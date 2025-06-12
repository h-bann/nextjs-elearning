// components/verification/VerificationStatus.jsx
import { Shield, CheckCircle, AlertCircle } from "lucide-react";

export default function VerificationStatus({ user, verificationData }) {
  const isVerified = user.oneid_verified;

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="mb-4 flex items-center text-lg font-semibold">
        <Shield className="mr-2 h-5 w-5" />
        Age Verification Status
      </h3>

      {isVerified ? (
        <div className="flex items-start space-x-3">
          <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
          <div>
            <p className="text-sm font-medium text-green-800">Verified</p>
            <p className="text-sm text-green-700">
              Your age has been verified with OneId. You can purchase courses
              without additional verification.
            </p>
            {verificationData?.oneid_verification_date && (
              <p className="mt-1 text-xs text-gray-500">
                Verified on:{" "}
                {new Date(
                  verificationData.oneid_verification_date,
                ).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-start space-x-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-medium text-amber-800">Not Verified</p>
            <p className="mb-3 text-sm text-amber-700">
              Age verification is required to purchase courses on our platform.
            </p>
            <a
              href="/verification/oneid"
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium leading-4 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Shield className="mr-2 h-4 w-4" />
              Verify Age with OneId
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
