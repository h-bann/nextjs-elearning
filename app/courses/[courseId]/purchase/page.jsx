// app/courses/[courseId]/purchase/page.jsx
import { getServerSession } from "@/lib/serverAuth";
import mySQL from "@/lib/database";
import { redirect } from "next/navigation";
import { getCourse, checkExistingEnrollment } from "@/lib/queries";
import PurchaseForm from "@/components/courses/purchase/PurchaseForm";
import VerificationRequired from "@/components/verification/VerificationRequired";

async function getCheckoutData(courseId, userId) {
  // Get course details
  const courses = await mySQL(getCourse, [courseId]);
  if (!courses.length) {
    return null;
  }

  // Check if already purchased
  const purchases = await mySQL(checkExistingEnrollment, [userId, courseId]);
  if (purchases.length) {
    return { alreadyPurchased: true };
  }

  // Check OneId verification status and user role
  const verificationData = await mySQL(
    `SELECT oneid_verified, oneid_verification_date, role 
     FROM users 
     WHERE id = ?`,
    [userId],
  );

  const userData = verificationData[0];
  const isVerified = userData && userData.oneid_verified;
  const userRole = userData ? userData.role : null;

  return {
    course: courses[0],
    alreadyPurchased: false,
    isVerified: isVerified,
    verificationDate: userData?.oneid_verification_date,
    userRole: userRole,
  };
}

export default async function PurchasePage({ params }) {
  const { courseId } = await params;
  const user = await getServerSession();

  if (!user) {
    redirect("/auth/signup?redirect=/dashboard");
    return null;
  }

  const checkoutData = await getCheckoutData(courseId, user.id);

  if (!checkoutData) {
    redirect("/courses");
  }

  if (checkoutData.alreadyPurchased) {
    redirect(`/dashboard`);
  }

  // If user is not verified AND not an instructor, show verification requirement
  if (!checkoutData.isVerified && checkoutData.userRole !== "instructor") {
    return (
      <div className="container mx-auto px-4 py-8">
        <VerificationRequired
          course={checkoutData.course}
          courseId={courseId}
        />
      </div>
    );
  }

  // User is verified OR is an instructor, show purchase form
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Purchase Course</h1>

      {/* Show verification status only for non-instructors */}
      {checkoutData.userRole !== "instructor" && (
        <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Age Verified
              </h3>
              <div className="mt-1 text-sm text-green-700">
                Your age has been verified with OneId. You can now purchase
                courses.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show instructor notice */}
      {checkoutData.userRole === "instructor" && (
        <div className="mb-6 rounded-md border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Instructor Account
              </h3>
              <div className="mt-1 text-sm text-blue-700">
                As an instructor, you can purchase courses without age
                verification.
              </div>
            </div>
          </div>
        </div>
      )}

      <PurchaseForm course={checkoutData.course} userId={user.id} />
    </div>
  );
}
