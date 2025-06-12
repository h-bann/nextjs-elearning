// app/verification/oneid/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export default function OneIdVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get the course ID and any other params from the URL
  // const courseId = searchParams.get("courseId");
  // const returnUrl =
  //   searchParams.get("returnUrl") || `/courses/${courseId}/purchase`;
  // console.log(returnUrl);

  const handleVerification = async () => {
    setLoading(true);
    setError("");

    try {
      // Generate a random state parameter for security
      const randomId = uuidv4();
      const clientId = process.env.NEXT_PUBLIC_ONEID_CLIENT_ID;

      // Store the state and return URL in session storage for validation
      sessionStorage.setItem("oneid_state", randomId);
      // sessionStorage.setItem("oneid_return_url", returnUrl);

      // Redirect to OneId verification
      const oneIdUrl = `https://controller.sandbox.myoneid.co.uk/v2/authorize?client_id=${clientId}&redirect_uri=https://professionaldominatrixlondon.com&response_type=code&scope=openid age_over_18 product:age_check&state=${randomId}`;
      window.location.href = oneIdUrl;
    } catch (err) {
      setError("Failed to initiate verification process");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <Shield className="mx-auto mb-4 h-12 w-12 text-blue-600" />
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Age Verification Required
            </h2>
            <p className="mb-6 text-gray-600">
              To purchase courses on our platform, you need to verify that you
              are over 18 years old. This is a one-time verification process
              using OneId.
            </p>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 p-3 text-red-600">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            <div className="mb-6 rounded-md bg-blue-50 p-4">
              <div className="flex items-start">
                <Shield className="mr-2 mt-0.5 h-5 w-5 text-blue-600" />
                <div className="text-left text-sm text-blue-800">
                  <p className="mb-1 font-medium">Secure & Private</p>
                  <p>
                    OneId uses bank-level security to verify your age without
                    storing personal information on our servers.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleVerification}
              disabled={loading}
              className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting to OneId...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Verify with OneId
                </>
              )}
            </button>

            <div className="mt-6">
              <button
                onClick={() => router.back()}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                ← Back to course
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
