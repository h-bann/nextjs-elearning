// import { redirect } from "next/navigation";
// import { CheckCircle, BookOpen, ArrowRight } from "lucide-react";
// import mySQL from "@/lib/db/database";
// import { getCourse } from "@/lib/db/queries";
// import { getServerSession } from "@/lib/auth/auth-actions";
// import { stripe } from "@/lib/stripe/stripe";

// export default async function PurchaseSuccessPage({ params, searchParams }) {
//   const { courseId } = await params;
//   const { session_id: sessionId } = await searchParams;

//   console.log(
//     "🎉 Success page accessed for course:",
//     courseId,
//     "session:",
//     sessionId,
//   );

//   if (!sessionId) {
//     redirect(`/courses/${courseId}/purchase`);
//   }

//   try {
//     // Get session from Stripe first (this contains user info)
//     const session = await stripe.checkout.sessions.retrieve(sessionId);
//     console.log("📋 Stripe session retrieved:", session.id);
//     console.log("💰 Payment status:", session.payment_status);
//     console.log("👤 Session metadata:", session.metadata);

//     if (session.payment_status !== "paid") {
//       console.log("❌ Payment not completed, redirecting");
//       redirect(`/courses/${courseId}/purchase?error=payment_incomplete`);
//     }

//     // Get user from session metadata (fallback if cookie auth fails)
//     const sessionUserId = session.metadata?.userId;
//     const sessionCourseId = session.metadata?.courseId;

//     if (!sessionUserId || sessionCourseId !== courseId) {
//       console.log("❌ Invalid session metadata");
//       redirect(`/courses/${courseId}/purchase?error=invalid_session`);
//     }

//     // Try to get authenticated user (but don't fail if it doesn't work)
//     let authenticatedUser = null;
//     try {
//       authenticatedUser = await requireAuth();
//       console.log("👤 Authenticated user:", authenticatedUser);
//     } catch (authError) {
//       console.log("⚠️ Auth failed, but continuing with session metadata");
//     }

//     // If authenticated user doesn't match session user, there's a cookie issue
//     if (
//       authenticatedUser &&
//       authenticatedUser.id.toString() !== sessionUserId
//     ) {
//       console.log(
//         "⚠️ User mismatch - cookie may have been lost during payment",
//       );
//     }

//     // Get course details
//     const courseData = await mySQL(getCourse, [courseId]);
//     const course = courseData[0];

//     if (!course) {
//       redirect("/courses");
//     }

//     // Verify enrollment exists
//     const enrollments = await mySQL(
//       `SELECT * FROM enrollments WHERE user_id = ? AND course_id = ? AND status = 'ACTIVE' ORDER BY enrolled_at DESC LIMIT 1`,
//       [parseInt(sessionUserId), parseInt(courseId)],
//     );

//     if (enrollments.length === 0) {
//       console.log("❌ No active enrollment found");
//       redirect(`/courses/${courseId}/purchase?error=enrollment_not_found`);
//     }

//     console.log("✅ Purchase verified successfully");

//     return (
//       <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
//         <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
//           {/* Success Icon */}
//           <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
//             <CheckCircle className="h-10 w-10 text-green-600" />
//           </div>

//           {/* Success Message */}
//           <h1 className="mb-2 text-2xl font-bold text-gray-900">
//             Payment Successful!
//           </h1>

//           <p className="mb-6 text-gray-600">
//             You now have access to <strong>{course.title}</strong>
//           </p>

//           {/* Course Info */}
//           <div className="mb-8 rounded-lg bg-gray-50 p-4">
//             <img
//               src={course.image_url || "/api/placeholder/400/300"}
//               alt={course.title}
//               className="mx-auto mb-3 h-16 w-16 rounded-lg object-cover"
//             />
//             <h3 className="font-medium text-gray-900">{course.title}</h3>
//             <p className="text-sm text-gray-500">
//               Amount paid: £{parseFloat(course.price).toFixed(2)}
//             </p>
//           </div>

//           {/* Action Buttons */}
//           <div className="space-y-3">
//             {/* If no authenticated user, suggest sign in first */}
//             {!authenticatedUser ? (
//               <>
//                 <a
//                   href={`/auth/signin?redirect=${encodeURIComponent(`/courses/${courseId}/learn`)}`}
//                   className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
//                 >
//                   Sign In to Access Course
//                 </a>
//                 <p className="text-sm text-gray-500">
//                   You may need to sign in again to access your course
//                 </p>
//               </>
//             ) : (
//               <>
//                 <a
//                   href={`/courses/${courseId}/learn`}
//                   className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
//                 >
//                   <BookOpen className="mr-2 h-5 w-5" />
//                   Start Learning
//                   <ArrowRight className="ml-2 h-4 w-4" />
//                 </a>

//                 <a
//                   href="/dashboard/courses"
//                   className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
//                 >
//                   View My Courses
//                 </a>
//               </>
//             )}
//           </div>

//           {/* Receipt Info */}
//           <div className="mt-8 border-t pt-6 text-sm text-gray-500">
//             <p>
//               A receipt has been sent to your email address.
//               <br />
//               Transaction ID: {sessionId.substring(0, 20)}...
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   } catch (error) {
//     console.error("❌ Error on success page:", error);
//     redirect(`/courses/${courseId}/purchase?error=verification_failed`);
//   }
// }
import { redirect } from "next/navigation";
import { CheckCircle, BookOpen, ArrowRight, RefreshCw } from "lucide-react";
import mySQL from "@/lib/db/database";
import { getCourse } from "@/lib/db/queries";
import { getServerSession } from "@/lib/auth/auth-actions";
import { stripe } from "@/lib/stripe/stripe";

export default async function PurchaseSuccessPage({ params, searchParams }) {
  const { courseId } = await params;
  const { session_id: sessionId, retry } = await searchParams;

  console.log("🎉 Success page accessed, retry:", retry);

  if (!sessionId) {
    redirect(`/courses/${courseId}/purchase`);
  }

  // Get Stripe session first to verify payment
  let stripeSession;
  try {
    stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("💳 Payment status:", stripeSession.payment_status);
    console.log("👤 Session user ID:", stripeSession.metadata?.userId);
  } catch (error) {
    console.error("❌ Invalid session");
    redirect(`/courses/${courseId}/purchase?error=invalid_session`);
  }

  if (stripeSession.payment_status !== "paid") {
    redirect(`/courses/${courseId}/purchase?error=payment_incomplete`);
  }

  // Check authentication
  let user = null;
  let authFailed = false;

  try {
    user = await getServerSession();
    console.log("👤 Auth check:", user ? "success" : "failed");
  } catch (authError) {
    console.log("❌ Auth failed:", authError.message);
    authFailed = true;
  }

  // Get course details
  const courseData = await mySQL(getCourse, [courseId]);
  const course = courseData[0];

  if (!course) {
    redirect("/courses");
  }

  // Verify enrollment exists (using Stripe session metadata)
  const sessionUserId = stripeSession.metadata?.userId;
  const sessionCourseId = stripeSession.metadata?.courseId;

  if (!sessionUserId || sessionCourseId !== courseId) {
    redirect(`/courses/${courseId}/purchase?error=invalid_metadata`);
  }

  // Check enrollment status
  const enrollment = await mySQL(
    `SELECT * FROM enrollments WHERE user_id = ? AND course_id = ? AND status = 'ACTIVE' ORDER BY enrolled_at DESC LIMIT 1`,
    [parseInt(sessionUserId), parseInt(courseId)],
  );

  if (enrollment.length === 0) {
    redirect(`/courses/${courseId}/purchase?error=enrollment_not_found`);
  }

  console.log("✅ Purchase and enrollment verified");

  // If authentication failed but we haven't tried a retry, try refreshing once
  if (authFailed && !retry) {
    console.log("🔄 Auth failed on first try, attempting refresh...");
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <RefreshCw className="h-10 w-10 animate-spin text-blue-600" />
          </div>
          <h1 className="mb-4 text-xl font-bold text-gray-900">
            Completing Your Purchase...
          </h1>
          <p className="mb-6 text-gray-600">
            Your payment was successful! We're just finishing up the enrollment
            process.
          </p>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                setTimeout(() => {
                  window.location.href = '/courses/${courseId}/purchase/success?session_id=${sessionId}&retry=true';
                }, 2000);
              `,
            }}
          />
        </div>
      </div>
    );
  }

  // If still no auth after retry, redirect to sign-in with return URL
  if (authFailed && retry) {
    console.log("🔄 Auth still failed after retry, redirecting to sign-in");
    const returnUrl = `/courses/${courseId}/purchase/success?session_id=${sessionId}&retry=true`;
    redirect(`/auth/signin?redirect=${encodeURIComponent(returnUrl)}`);
  }

  // Success! Show the completion page
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
          Welcome to <strong>{course.title}</strong>! You now have full access
          to the course.
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
          {retry && (
            <p className="mt-2 text-xs text-blue-600">
              ✅ Authentication restored
            </p>
          )}
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
