// app/api/webhooks/ccbill/route.js
import mySQL from "@/lib/database";

export async function POST(req) {
  try {
    const data = await req.json();

    // Verify webhook authenticity (implement according to CCBill docs)

    const { transactionId, purchaseId, status } = data;

    if (status === "APPROVED") {
      // Update purchase record
      await mySQL(
        "UPDATE purchases SET transaction_id = ?, status = ? WHERE id = ?",
        [transactionId, "COMPLETED", purchaseId]
      );

      // Create enrollment
      await mySQL(
        `INSERT INTO enrollments (user_id, course_id)
         SELECT user_id, course_id FROM purchases WHERE id = ?`,
        [purchaseId]
      );
    } else {
      await mySQL(
        "UPDATE purchases SET transaction_id = ?, status = ? WHERE id = ?",
        [transactionId, "FAILED", purchaseId]
      );
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
