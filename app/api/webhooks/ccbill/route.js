// app/api/webhooks/ccbill/route.js
import mySQL from "@/lib/database";
import {
  createEnrollmentFromPurchase,
  updatePurchaseStatus,
} from "@/lib/queries";

export async function POST(req) {
  try {
    const data = await req.json();

    // Verify webhook authenticity (implement according to CCBill docs)

    const { transactionId, purchaseId, status } = data;

    if (status === "APPROVED") {
      // Update purchase record
      await mySQL(updatePurchaseStatus, [
        transactionId,
        "COMPLETED",
        purchaseId,
      ]);

      // Create enrollment
      await mySQL(createEnrollmentFromPurchase, [purchaseId]);
    } else {
      await mySQL(
        "UPDATE purchases SET transaction_id = ?, status = ? WHERE id = ?",
        [transactionId, "FAILED", purchaseId],
      );
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
