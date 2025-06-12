// components/courses/PurchaseForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function PurchaseForm({ course, userId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const randomId = uuidv4();

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
    <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md">
      {error && (
        <div className="mb-4 rounded-md bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">{course.title}</h2>
        <p className="mb-4 text-gray-600">{course.description}</p>
        <div className="text-2xl font-bold text-blue-600">£{course.price}</div>
      </div>

      <button
        onClick={handlePurchase}
        disabled={loading}
        className="w-full rounded-md bg-accent-light py-3 font-medium text-white hover:bg-accent disabled:opacity-50"
      >
        {loading ? "Processing..." : "Purchase Course"}
      </button>
      <a
        href={`https://controller.sandbox.myoneid.co.uk/v2/authorize?client_id=486510f3-3c91-4de9-8aa4-7a72313babf2&redirect_uri=https://professionaldominatrixlondon.com&response_type=code&scope=openid age_over_18 product:age_check&state=${randomId}`}
      >
        Verify with OneID
      </a>
    </div>
  );
}
