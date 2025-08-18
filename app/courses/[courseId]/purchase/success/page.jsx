import { redirect } from "next/navigation";
import { CheckCircle, BookOpen, ArrowRight } from "lucide-react";
import mySQL from "@/lib/db/database";
import { getCourse, checkExistingEnrollment } from "@/lib/db/queries";
import { requireAuth } from "@/lib/auth/auth-actions";
import { stripe } from "@/lib/stripe/stripe";

async function verifyPurchase(sessionId, userId, courseId) {
  try {
    // Get the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify the session belongs to the current user and course
    if (
      session.metadata?.userId !== userId.toString() ||
      session.metadata?.courseId !== courseId.toString()
    ) {
      return { valid: false, session: null };
    }

    // Check if payment was successful
    if (session.payment_status === "paid") {
      // Verify enrollment exists in database
      const enrollment = await mySQL(checkExistingEnrollment, [
        userId,
        courseId,
      ]);

      if (enrollment.length > 0 && enrollment[0].status === "ACTIVE") {
        return { valid: true, session, enrollment: enrollment[0] };
      }
    }

    return { valid: false, session };
  } catch (error) {
    console.error("Error verifying purchase:", error);
    return { valid: false, session: null };
  }
}

export default async function PurchaseSuccessPage({ params, searchParams }) {
  const user = await requireAuth();
  const { courseId } = await params;
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    redirect(`/courses/${courseId}/purchase`);
  }

  // Get course details
  const courseData = await mySQL(getCourse, [courseId]);
  const course = courseData[0];

  if (!course) {
    redirect("/courses");
  }

  // Verify the purchase
  const purchaseVerification = await verifyPurchase(
    sessionId,
    user.id,
    courseId,
  );

  if (!purchaseVerification.valid) {
    redirect(`/courses/${courseId}/purchase?error=verification_failed`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        {/* Success Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Payment Successful!
        </h1>

        <p className="mb-6 text-gray-600">
          You now have access to <strong>{course.title}</strong>
        </p>

        {/* Course Info */}
        <div className="mb-8 rounded-lg bg-gray-50 p-4">
          <img
            src={course.image_url || "/api/placeholder/400/300"}
            alt={course.title}
            className="mx-auto mb-3 h-16 w-16 rounded-lg object-cover"
          />
          <h3 className="font-medium text-gray-900">{course.title}</h3>
          <p className="text-sm text-gray-500">
            Amount paid: £{parseFloat(course.price).toFixed(2)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <a
            href={`/courses/${courseId}/learn`}
            className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            Start Learning
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>

          <a
            href="/dashboard/courses"
            className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            View My Courses
          </a>
        </div>

        {/* Receipt Info */}
        <div className="mt-8 border-t pt-6 text-sm text-gray-500">
          <p>
            A receipt has been sent to your email address.
            <br />
            Transaction ID: {sessionId.substring(0, 20)}...
          </p>
        </div>
      </div>
    </div>
  );
}
