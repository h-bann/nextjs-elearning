// components/courses/PurchaseForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PurchaseForm({ course, userId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handlePurchase = async () => {
    setLoading(true);
    setError("");

    try {
      // Initialize purchase record
      const initResponse = await fetch("/api/purchases/initialise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          amount: course.price,
        }),
      });

      if (!initResponse.ok) throw new Error("Failed to initialize purchase");
      console.log("INITRESPONSE", initResponse);
      const { purchaseId, ccBillUrl } = await initResponse.json();

      // Redirect to CCBill payment page
      window.location.href = ccBillUrl;
    } catch (err) {
      setError("Failed to process purchase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
        <p className="text-gray-600 mb-4">{course.description}</p>
        <div className="text-2xl font-bold text-blue-600">${course.price}</div>
      </div>

      <button
        onClick={handlePurchase}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Purchase Course"}
      </button>
    </div>
  );
}
