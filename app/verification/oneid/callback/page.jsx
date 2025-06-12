// app/verification/oneid/callback/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function OneIdCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // const code = searchParams.get("code");
        // const state = searchParams.get("state");
        const error = searchParams.get("error");

        const code =
          "eyJhbGciOiJkaXIiLCJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwidHlwIjoiSldUIn0..mtWf7jwT3cgJI7gk.xpi5jZQbV_vY7AJr8YPRykJQaE3Qg2aotEW_PCS2Pcp18LEa4037nh2iaHJ2t1tj110IfJnv_MPN7y8wDEVMnjKHrT_GYhYGAIwrXM6RmASIjTD7lJO7PoQoj7zOQasCPRh-tCY7tefBe2BtD8FY-r6wCmrYnE4YF6gIjD3pM08SbJm3eCk2PxE-7727yKHpnDzwyw572Dkd79zKNou23OCgBr8idcIZMPrKJC1rVNQzPhs8TuOGQ-e64VDsCtS9vV8Dqw7Sbjhib-O02hDXWSGAbc5-Kov0eFs-KsArHTlbQ4oBeXeyyBGLjCq4bI3tRMZy74qtctvlHIwqlnR1l11wtxDr0zcu9Y8fXKbJfYti3Rq_ynatBpZfyaVKs4eeWA1lRs74Bt2h9cCXHBEOQf6kgVHQH4N5CLz5TONZgsuR5VFYb2TYsJDcqFW9-K6JPAK-c39W6lUVvJ0Elx8usnRkAwwJ5tDXvLWq8OKbviXlysb6b-C3o_HpiI_Pipz-4Bz0xVYLLYE4KcrgmzjUAYoDD62kzz9uhjpY-hj-hsjKOPsyYg1Y215U183pmW0jtmwEKKvN8ZWGf_xR-jUBi5ub-oDSnnBYUQoq1tn_zHdDm_HuAdNB-m51HzoJ0njJWjj3Ompm2gAn7I3uFIUIxKaTvfNvMjUfG7KMC52wDakUhjggDP6dLIkE20rmWKqTkzTeHnikiy7JadukIjzcpXLKgarmhxBeNr7DDSEB0bzC2--mlXZ-V6UYwy1_zrppc9ZvPw2YIeCFC4NTQFMPC5ovQpDGQmCHfuFqQVO9GxMgLz4vkTbUNrYjrGHOvtadMNX5HOirPR6lJFeFZ8_vMbfE1qoglFPh39osNvwmuR6wg2jdpZnwd0ZLUAfzswYdD2KP.b8Djpg5ro60KCd6aI06erw";
        const state = "d643b031-3a86-4805-b68b-1f42acf4bbef";

        // Check for OAuth errors
        if (error) {
          setStatus("error");
          setMessage("Verification was cancelled or failed. Please try again.");
          return;
        }

        // Validate state parameter
        const storedState = sessionStorage.getItem("oneid_state");
        if (!state || state !== storedState) {
          setStatus("error");
          setMessage("Invalid verification request. Please try again.");
          return;
        }

        // Exchange code for tokens and verify user
        const response = await fetch("/api/verification/oneid/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, state }),
        });

        const data = await response.json();

        console.log(data);
        if (!response.ok) {
          throw new Error(data.message || "Verification failed");
        }

        setStatus("success");
        setMessage("Age verification successful! Redirecting...");

        // Clean up session storage
        sessionStorage.removeItem("oneid_state");

        // Redirect to the original return URL after a short delay
        const returnUrl =
          sessionStorage.getItem("oneid_return_url") || "/dashboard";
        sessionStorage.removeItem("oneid_return_url");

        setTimeout(() => {
          router.push("/courses");
        }, 2000);
      } catch (error) {
        console.error("Callback error:", error);
        setStatus("error");
        setMessage(error.message || "An error occurred during verification");
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === "processing" && (
              <>
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
                <h2 className="mb-4 text-xl font-bold text-gray-900">
                  Processing Verification
                </h2>
                <p className="text-gray-600">
                  Please wait while we verify your age with OneId...
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
                <h2 className="mb-4 text-xl font-bold text-gray-900">
                  Verification Successful!
                </h2>
                <p className="mb-4 text-gray-600">{message}</p>
                <div className="rounded-md bg-green-50 p-3">
                  <p className="text-sm text-green-800">
                    You can now purchase courses without needing to verify
                    again.
                  </p>
                </div>
              </>
            )}

            {status === "error" && (
              <>
                <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                <h2 className="mb-4 text-xl font-bold text-gray-900">
                  Verification Failed
                </h2>
                <p className="mb-6 text-gray-600">{message}</p>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push("/verification/oneid")}
                    className="w-full rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
