"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { resendVerification } from "@/lib/auth-actions";
import { useFormState, useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";

// Submit button with loading state
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full justify-center rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-hover disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Sending...
        </>
      ) : (
        "Resend Verification Email"
      )}
    </button>
  );
}

export default function ResendVerificationPage() {
  const searchParams = useSearchParams();
  const defaultEmail = searchParams.get("email") || "";

  // Initial state for the form
  const initialState = { success: false, error: null };

  // Use the form state hook with our server action
  const [state, formAction] = useFormState(resendVerification, initialState);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white px-8 py-10 shadow sm:rounded-lg sm:px-10">
          <h2 className="mb-6 text-center text-2xl font-bold">
            Resend Verification Email
          </h2>

          {state.success ? (
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
              <p className="mb-6">{state.message}</p>
              <a href="/auth/signin" className="text-primary hover:underline">
                Back to Sign In
              </a>
            </div>
          ) : (
            <>
              {state.error && (
                <div className="mb-4 flex items-center rounded-md bg-red-50 p-4 text-red-600">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  {state.error}
                </div>
              )}

              <form action={formAction} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      defaultValue={defaultEmail}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div>
                  <SubmitButton />
                </div>

                <div className="text-center text-sm">
                  <a
                    href="/auth/signin"
                    className="text-primary hover:underline"
                  >
                    Back to Sign In
                  </a>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
