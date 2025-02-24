import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mySQL from "@/lib/database";
import { redirect } from "next/navigation";
import {
  getCourse,
  getLoggedInUser,
  checkPurchase,
  checkExistingEnrollment,
} from "@/lib/queries";
import PurchaseForm from "@/components/courses/purchase/PurchaseForm";

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

  return {
    course: courses[0],
    alreadyPurchased: false,
  };
}

export default async function PurchasePage({ params }) {
  const { courseId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  //   // Redirect if not logged in
  //   if (!token) {
  //     redirect(
  //       "/auth/signin?redirect=" +
  //         encodeURIComponent(`/courses/${courseId}/purchase`)
  //     );
  //   }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const users = await mySQL(getLoggedInUser, [decoded.userId]);

  if (!users.length) {
    redirect("/auth/signin");
  }

  const checkoutData = await getCheckoutData(courseId, users[0].id);
  console.log("CHECKOUT DATA", checkoutData);
  if (!checkoutData) {
    redirect("/courses");
  }

  if (checkoutData.alreadyPurchased) {
    // redirect(`/dashboard/courses/${courseId}`);
    redirect(`/dashboard`);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Purchase Course</h1>
      <PurchaseForm course={checkoutData.course} userId={users[0].id} />
    </div>
  );
}
