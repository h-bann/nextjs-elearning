import mySQL from "@/lib/db/database";
import {
  getCourseWithStripe,
  checkExistingEnrollment,
  createEnrollmentWithPayment,
} from "@/lib/db/queries";
import { createCheckoutSession } from "@/lib/stripe/stripe";
import { requireAuth } from "@/lib/auth/auth-actions";

export async function POST(req) {
  try {
    // Verify authentication
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json(
        {
          error: "Not authenticated",
        },
        { status: 400 },
      );
    }

    // Get request data
    const { courseId } = await req.json();

    if (!courseId) {
      return Response.json(
        { message: "Course ID is required" },
        { status: 400 },
      );
    }

    // Get course data
    const courseData = await mySQL(getCourseWithStripe, [courseId]);
    const course = courseData[0];

    if (!course) {
      return Response.json({ message: "Course not found" }, { status: 404 });
    }

    if (!course.published) {
      return Response.json(
        { message: "Course is not available for purchase" },
        { status: 400 },
      );
    }
    if (!course.stripe_price_id) {
      return Response.json(
        {
          message:
            "Payment not available for this course. Please contact support.",
        },
        { status: 400 },
      );
    }

    // Check if user already owns this course
    const existingEnrollment = await mySQL(checkExistingEnrollment, [
      user.id,
      courseId,
    ]);
    if (
      existingEnrollment.length > 0 &&
      existingEnrollment[0].status === "ACTIVE"
    ) {
      return Response.json(
        {
          message: "You already own this course",
        },
        { status: 400 },
      );
    }

    // Check if user is the instructor
    if (course.instructor_id === user.id) {
      return Response.json(
        {
          message: "You cannot purchase your own course",
        },
        { status: 400 },
      );
    }

    // Create checkout session
    const session = await createCheckoutSession({
      priceId: course.stripe_price_id,
      courseId: courseId,
      userId: user.id,
      successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/courses/${courseId}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/courses/${courseId}/purchase?cancelled=true`,
    });
    // Create pending enrollment record
    await mySQL(createEnrollmentWithPayment, [
      user.id,
      courseId,
      course.price,
      "PAYMENT_PENDING",
      session.payment_intent,
    ]);

    return Response.json({
      sessionId: session.id,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return Response.json(
      {
        message: "Failed to create checkout session",
      },
      { status: 500 },
    );
  }
}
