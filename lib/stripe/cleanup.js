import { stripe } from "./stripe";

// Helper function to archive a Stripe product when course is deleted
export async function archiveStripeProduct(productId) {
  try {
    // Archive the product (Stripe doesn't allow deletion, only archiving)
    await stripe.products.update(productId, {
      active: false,
    });

    // Get all prices for this product and deactivate them
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
    });

    for (const price of prices.data) {
      await stripe.prices.update(price.id, {
        active: false,
      });
    }

    console.log(`Archived Stripe product ${productId} and its prices`);
    return true;
  } catch (error) {
    console.error("Error archiving Stripe product:", error);
    return false;
  }
}

// Helper function to create a refund if needed
export async function createRefund(
  paymentIntentId,
  amount = null,
  reason = "requested_by_customer",
) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount, // null means full refund
      reason: reason,
    });

    console.log(
      `Refund created: ${refund.id} for payment intent ${paymentIntentId}`,
    );
    return refund;
  } catch (error) {
    console.error("Error creating refund:", error);
    throw error;
  }
}

// Helper function to get payment details
export async function getPaymentDetails(paymentIntentId) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error("Error retrieving payment intent:", error);
    throw error;
  }
}
