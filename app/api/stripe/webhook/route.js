import { headers } from "next/headers";
import { stripe } from "@/lib/stripe/stripe";
import mySQL from "@/lib/db/database";
import {
  updateEnrollmentStatusAfterPayment,
  getEnrollmentByPaymentIntent,
} from "@/lib/db/queries";

export async function POST(req) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("No Stripe signature found");
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
      console.error("Webhook signature verification failed:", err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log(`Payment succeeded: ${paymentIntent.id}`);

        try {
          // Get enrollment by payment intent
          const enrollments = await mySQL(getEnrollmentByPaymentIntent, [
            paymentIntent.id,
          ]);

          if (enrollments.length === 0) {
            console.error(
              `No enrollment found for payment intent: ${paymentIntent.id}`,
            );
            break;
          }

          const enrollment = enrollments[0];

          // Update enrollment status to ACTIVE
          await mySQL(updateEnrollmentStatusAfterPayment, [
            paymentIntent.id,
            enrollment.user_id,
          ]);

          console.log(
            `Enrollment activated for user ${enrollment.user_id}, course ${enrollment.course_id}`,
          );
        } catch (error) {
          console.error("Error processing successful payment:", error);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log(`Payment failed: ${paymentIntent.id}`);

        try {
          // You might want to update the enrollment status to FAILED or delete it
          // For now, we'll just log it
          const enrollments = await mySQL(getEnrollmentByPaymentIntent, [
            paymentIntent.id,
          ]);

          if (enrollments.length > 0) {
            const enrollment = enrollments[0];
            console.log(
              `Payment failed for user ${enrollment.user_id}, course ${enrollment.course_id}`,
            );

            // Optionally update enrollment status to FAILED
            await mySQL(
              `UPDATE enrollments SET status = 'FAILED' WHERE stripe_payment_intent_id = ?`,
              [paymentIntent.id],
            );
          }
        } catch (error) {
          console.error("Error processing failed payment:", error);
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object;
        console.log(`Checkout session completed: ${session.id}`);

        // Additional verification - the payment_intent.succeeded event should handle the main logic
        // but you can add additional processing here if needed
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response("Webhook processed", { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Webhook processing failed", { status: 500 });
  }
}

// Disable body parsing for webhooks
export const runtime = "nodejs";
export const preferredRegion = "auto";
