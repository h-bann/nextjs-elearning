import mySQL from "@/lib/db/database";
import {
  getLoggedInUser,
  insertCourse,
  updateCourseStripeIds,
} from "@/lib/db/queries";
import { requireAuth } from "@/lib/auth/auth-actions";
import { NextResponse } from "next/server";
import { createStripeProductForCourse } from "@/lib/stripe/stripe";

// ! OVERALL COURSE CREATION ROUTE
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

    // Verify user is an instructor
    const isInstructor = await mySQL(getLoggedInUser, [user.userId]);
    if (!isInstructor.length || user.role !== "instructor") {
      return Response.json(
        { message: "Unauthorized - Instructor access required" },
        { status: 403 },
      );
    }

    // Get course data from request
    const { title, description, price, imageUrl } = await req.json();

    // Validate required fields
    if (!title || !description || !price || !imageUrl) {
      return Response.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate price
    const coursePrice = parseFloat(price);
    if (isNaN(coursePrice) || coursePrice <= 0) {
      return Response.json({ message: "Invalid price" }, { status: 400 });
    }

    // Insert course into database
    const courseResult = await mySQL(insertCourse, [
      title,
      description,
      coursePrice,
      imageUrl,
      user.id,
      null, // Default to unpublished
      null, // stripe_product_id (will be updated)
      null, // stripe_price_id (will be updated)
    ]);

    const courseId = courseResult.insertId;

    try {
      const stripeData = await createStripeProductForCourse({
        id: courseId,
        title,
        description,
        price: coursePrice,
        image_url: imageUrl,
        instructorId: user.id,
      });

      await mySQL(updateCourseStripeIds, [
        stripeData.productId,
        stripeData.priceId,
        courseId,
        user.id,
      ]);

      console.log(
        `Course ${courseId} created with Stripe product ${stripeData.productId}`,
      );

      return Response.json(
        {
          message: "Course created successfully",
          courseId: courseId,
          stripeProductId: stripeData.productId,
          stripePriceId: stripeData.priceId,
        },
        { status: 201 },
      );
    } catch (stripeError) {
      console.error("Stripe product creation failed:", stripeError);
      return Response.json(
        {
          message:
            "Course created but payment setup failed. Please contact support.",
          courseId: courseId,
          warning: "Payment processing not available for this course yet",
        },
        { status: 201 },
      );
    }
  } catch (error) {
    console.error("Course creation error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
