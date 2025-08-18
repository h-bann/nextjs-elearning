"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard, Shield, ArrowLeft } from "lucide-react";

export default function PurchaseForm({ course, userId, userRole }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handlePurchase = async () => {
    setLoading(true);
    setError("");

    try {
      // Create Stripe checkout session
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: course.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create checkout session");
      }

      // Redirect to Stripe checkout
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Course
      </button>

      {/* Course Preview */}
      <div className="mb-8 overflow-hidden rounded-lg bg-white shadow-lg">
        <div className="aspect-video relative">
          <img
            src={course.image_url || "/api/placeholder/400/300"}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="p-6">
          <h1 className="mb-2 text-2xl font-bold">{course.title}</h1>
          <p className="mb-4 text-gray-600">{course.description}</p>

          {/* Course Features */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center text-sm text-gray-600">
              <Shield className="mr-2 h-4 w-4 text-green-500" />
              Lifetime access
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CreditCard className="mr-2 h-4 w-4 text-blue-500" />
              Secure payment with Stripe
            </div>
          </div>

          {/* Price and Purchase */}
          <div className="border-t pt-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm text-gray-600">Total:</span>
              <span className="text-3xl font-bold text-gray-900">
                £{parseFloat(course.price).toFixed(2)}
              </span>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4 text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handlePurchase}
              disabled={loading}
              className="flex w-full items-center justify-center rounded-md bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Purchase Course
                </>
              )}
            </button>

            <p className="mt-4 text-center text-sm text-gray-500">
              Secure checkout powered by Stripe. You will be redirected to
              complete your payment.
            </p>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="rounded-lg bg-blue-50 p-4">
        <h3 className="mb-2 font-medium text-blue-900">What you'll get:</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Instant access to all course content</li>
          <li>• Progress tracking and completion certificates</li>
          <li>• Mobile and desktop access</li>
          <li>• 30-day money-back guarantee</li>
        </ul>
      </div>
    </div>
  );
}
