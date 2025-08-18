import mySQL from "@/lib/db/database";
import {
  checkInstructor,
  getCourseWithStripe,
  updateCourseWithImage,
  updateCourseWithoutImage,
} from "@/lib/db/queries";

// Updated course editing route to handle PUT requests for updating course details
export async function PUT(req, { params }) {
  const { courseId } = params;

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

    // Verify course ownership
    const courses = await mySQL(checkInstructor, [courseId]);

    if (!courses.length || courses[0].instructor_id !== user.id) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get course data from request
    const { title, description, price, imageUrl } = await req.json();

    // Validate required fields
    if (!title || !description || !price) {
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

    // Get current course data including Stripe IDs
    const currentCourseData = await mySQL(getCourseWithStripe, [courseId]);
    const currentCourse = currentCourseData[0];

    if (imageUrl) {
      await mySQL(updateCourseWithImage, [
        title,
        description,
        coursePrice,
        imageUrl,
        courseId,
        user.id,
      ]);
    } else {
      await mySQL(updateCourseWithoutImage, [
        title,
        description,
        coursePrice,
        courseId,
        user.id,
      ]);
    }

    // Update Stripe product if it exists
    if (currentCourse.stripe_product_id) {
      try {
        const stripeUpdateResult = await updateStripeProduct(
          currentCourse.stripe_product_id,
          {
            id: courseId,
            title,
            description,
            price: coursePrice,
            image_url: imageUrl || currentCourse.image_url,
          },
        );

        // Update price ID if it changed
        if (stripeUpdateResult.priceId !== currentCourse.stripe_price_id) {
          await mySQL(updateCourseStripePrice, [
            stripeUpdateResult.priceId,
            courseId,
            user.id,
          ]);
        }

        console.log(
          `Course ${courseId} and Stripe product updated successfully`,
        );
      } catch (stripeError) {
        console.error("Stripe update failed:", stripeError);
        // Continue execution - database update succeeded
      }
    }

    return Response.json(
      {
        message: "Course updated successfully",
        course: {
          id: courseId,
          title,
          description,
          price: coursePrice,
          image_url: imageUrl,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Course update error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
