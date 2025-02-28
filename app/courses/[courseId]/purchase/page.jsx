import { getServerSession } from "@/lib/serverAuth";
import mySQL from "@/lib/database";
import { redirect } from "next/navigation";
import { getCourse, checkExistingEnrollment } from "@/lib/queries";
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
  const user = await getServerSession();

  if (!user) {
    redirect("/auth/signin?redirect=/dashboard");
    return null;
  }

  const checkoutData = await getCheckoutData(courseId, user.id);
  console.log("CHECKOUT DATA", checkoutData);
  if (!checkoutData) {
    redirect("/courses");
  }

  if (checkoutData.alreadyPurchased) {
    redirect(`/dashboard`);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Purchase Course</h1>
      <PurchaseForm course={checkoutData.course} userId={user.id} />
    </div>
  );
}
