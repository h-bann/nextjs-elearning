import Stripe from "stripe";

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Helper function to create a Stripe product and price for a course
export async function createStripeProductForCourse(courseData) {
  try {
    // Create the product
    const product = await stripe.products.create({
      name: courseData.title,
      description: courseData.description,
      metadata: {
        courseId: courseData.id.toString(),
        instructorId: courseData.instructorId.toString(),
      },
      images: courseData.image_url ? [courseData.image_url] : [],
    });

    // Create the price (in pence for GBP)
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(parseFloat(courseData.price) * 100), // Convert to pence
      currency: "gbp",
      metadata: {
        courseId: courseData.id.toString(),
      },
    });

    return {
      productId: product.id,
      priceId: price.id,
    };
  } catch (error) {
    console.error("Error creating Stripe product:", error);
    throw error;
  }
}

// Helper function to update a Stripe product
export async function updateStripeProduct(productId, courseData) {
  try {
    // Update the product
    await stripe.products.update(productId, {
      name: courseData.title,
      description: courseData.description,
      images: courseData.image_url ? [courseData.image_url] : [],
    });

    // For price changes, we need to create a new price and deactivate the old one
    // Get existing prices
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
    });

    const currentPrice = prices.data[0];
    const newPriceAmount = Math.round(parseFloat(courseData.price) * 100);

    // Only create new price if amount has changed
    if (currentPrice && currentPrice.unit_amount !== newPriceAmount) {
      // Deactivate old price
      await stripe.prices.update(currentPrice.id, {
        active: false,
      });

      // Create new price
      const newPrice = await stripe.prices.create({
        product: productId,
        unit_amount: newPriceAmount,
        currency: "gbp",
        metadata: {
          courseId: courseData.id.toString(),
        },
      });

      return {
        productId: productId,
        priceId: newPrice.id,
      };
    }

    return {
      productId: productId,
      priceId: currentPrice?.id,
    };
  } catch (error) {
    console.error("Error updating Stripe product:", error);
    throw error;
  }
}

// Helper function to create checkout session
export async function createCheckoutSession({
  priceId,
  courseId,
  userId,
  successUrl,
  cancelUrl,
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        courseId: courseId.toString(),
        userId: userId.toString(),
      },
      customer_email: undefined, // Let Stripe collect this
      payment_intent_data: {
        metadata: {
          courseId: courseId.toString(),
          userId: userId.toString(),
        },
      },
    });

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}
