import { headers } from "next/headers";
import { stripe } from "@/lib/stripe/stripe";
import mySQL from "@/lib/db/database";
import {
  findPendingEnrollmentByUserAndCourse,
  activateEnrollmentWithPayment,
  markEnrollmentAsFailed,
  getEnrollmentById,
} from "@/lib/db/queries";

export async function POST(req) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("❌ No Stripe signature found");
      return new Response("No signature", { status: 400 });
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        // Only process if payment was successful
        if (session.payment_status === "paid") {
          try {
            const { userId, courseId } = session.metadata;

            if (!userId || !courseId) {
              console.error("❌ Missing metadata in session");
              break;
            }

            // Find enrollment by user and course using abstracted query

            const enrollments = await mySQL(
              findPendingEnrollmentByUserAndCourse,
              [parseInt(userId), parseInt(courseId)],
            );

            if (enrollments.length === 0) {
              console.error(
                "❌ No pending enrollment found for user",
                userId,
                "course",
                courseId,
              );
              break;
            }

            const enrollment = enrollments[0];

            // Update enrollment status to ACTIVE with payment intent and payment date

            const updateResult = await mySQL(activateEnrollmentWithPayment, [
              session.payment_intent,
              enrollment.id,
            ]);

            // Verify the update worked using abstracted query
            const verifyEnrollments = await mySQL(getEnrollmentById, [
              enrollment.id,
            ]);
          } catch (error) {
            console.error("❌ Error processing checkout completion:", error);
            console.error("📋 Error details:", error.stack);
          }
        } else {
          console.log(
            "⚠️ Payment not completed, status:",
            session.payment_status,
          );
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;

        // This is a backup - the checkout.session.completed should handle it
        console.log(
          "ℹ️ Payment intent succeeded (handled by checkout.session.completed)",
        );
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log("💔 Payment failed:", paymentIntent.id);
        console.log(
          "❌ Failure reason:",
          paymentIntent.last_payment_error?.message,
        );

        try {
          // Find enrollment by metadata and mark as failed
          const { userId, courseId } = paymentIntent.metadata;
          if (userId && courseId) {
            await mySQL(markEnrollmentAsFailed, [
              parseInt(userId),
              parseInt(courseId),
            ]);
          }
        } catch (error) {
          console.error("❌ Error processing failed payment:", error);
        }
        break;
      }
    }

    return new Response("Webhook processed", { status: 200 });
  } catch (error) {
    console.error("💥 Webhook processing error:", error);
    console.error("📋 Error stack:", error.stack);
    return new Response("Webhook processing failed", { status: 500 });
  }
}

// Disable body parsing for webhooks
export const runtime = "nodejs";
export const preferredRegion = "auto";
