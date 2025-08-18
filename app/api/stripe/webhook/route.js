import { headers } from "next/headers";
import { stripe } from "@/lib/stripe/stripe";
import mySQL from "@/lib/db/database";

export async function POST(req) {
  console.log("🔔 Webhook received");

  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    console.log("📝 Webhook body length:", body.length);
    console.log("🔐 Signature present:", !!signature);

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
      console.log("✅ Webhook signature verified");
      console.log("📋 Event type:", event.type);
      console.log("🆔 Event ID:", event.id);
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("🛒 Checkout session completed:", session.id);
        console.log("💰 Payment status:", session.payment_status);
        console.log("🆔 Payment intent:", session.payment_intent);
        console.log("📋 Session metadata:", session.metadata);

        // Only process if payment was successful
        if (session.payment_status === "paid") {
          try {
            const { userId, courseId } = session.metadata;
            console.log("👤 User ID from metadata:", userId);
            console.log("📚 Course ID from metadata:", courseId);

            if (!userId || !courseId) {
              console.error("❌ Missing metadata in session");
              break;
            }

            // Find enrollment by user and course (instead of payment intent)
            console.log(
              "🔍 Looking for enrollment for user",
              userId,
              "and course",
              courseId,
            );
            const enrollments = await mySQL(
              `SELECT * FROM enrollments WHERE user_id = ? AND course_id = ? AND status = 'PAYMENT_PENDING' ORDER BY enrolled_at DESC LIMIT 1`,
              [parseInt(userId), parseInt(courseId)],
            );

            console.log("📊 Found enrollments:", enrollments.length);

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
            console.log("📋 Processing enrollment:", {
              id: enrollment.id,
              user_id: enrollment.user_id,
              course_id: enrollment.course_id,
              current_status: enrollment.status,
            });

            // Update enrollment status to ACTIVE and store payment intent
            console.log("🔄 Updating enrollment status to ACTIVE...");
            const updateResult = await mySQL(
              `UPDATE enrollments SET status = 'ACTIVE', stripe_payment_intent_id = ? WHERE id = ?`,
              [session.payment_intent, enrollment.id],
            );

            console.log("✅ Update result:", updateResult);
            console.log(
              `🎉 Enrollment activated for user ${enrollment.user_id}, course ${enrollment.course_id}`,
            );

            // Verify the update worked
            const verifyEnrollments = await mySQL(
              `SELECT * FROM enrollments WHERE id = ?`,
              [enrollment.id],
            );
            console.log(
              "🔍 Verification - enrollment status after update:",
              verifyEnrollments[0]?.status,
            );
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
        console.log("💰 Payment intent succeeded:", paymentIntent.id);
        console.log("📋 Payment metadata:", paymentIntent.metadata);

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
          // Find enrollment by metadata
          const { userId, courseId } = paymentIntent.metadata;
          if (userId && courseId) {
            await mySQL(
              `UPDATE enrollments SET status = 'FAILED' WHERE user_id = ? AND course_id = ? AND status = 'PAYMENT_PENDING'`,
              [parseInt(userId), parseInt(courseId)],
            );
            console.log("🔄 Enrollment status updated to FAILED");
          }
        } catch (error) {
          console.error("❌ Error processing failed payment:", error);
        }
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    console.log("✅ Webhook processed successfully");
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
