"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { verifyEmail } from "@/lib/auth/auth-actions";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing");
      return;
    }

    const verify = async () => {
      try {
        // Call the server action
        const result = await verifyEmail(token);

        if (result.success) {
          setStatus("success");
          setMessage(
            result.message || "Your email has been verified successfully.",
          );

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } else {
          setStatus("error");
          setMessage(result.error || "Verification failed. Please try again.");
        }
      } catch (error) {
        console.error("Verification request failed:", error);
        setStatus("error");
        setMessage(
          "Connection error. Please try signing in - your account may already be verified.",
        );
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white px-8 py-10 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <h2 className="mb-6 text-2xl font-bold">Email Verification</h2>

            {status === "verifying" && (
              <div className="flex flex-col items-center">
                <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
                <p>Verifying your email address...</p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center">
                <CheckCircle className="mb-4 h-12 w-12 text-green-500" />
                <p className="mb-6">{message}</p>
                <p className="text-sm text-gray-500">
                  You are now signed in. Redirecting to your dashboard...
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center">
                <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
                <p className="mb-2 text-red-600">{message}</p>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => router.push("/auth/signin")}
                    className="block w-full rounded-md bg-primary px-4 py-2 text-center text-white hover:bg-primary-hover"
                  >
                    Try Signing In
                  </button>
                  <button
                    onClick={() => router.push("/auth/resend-verification")}
                    className="block w-full rounded-md border border-gray-300 px-4 py-2 text-center text-primary hover:bg-gray-50"
                  >
                    Resend Verification
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
