import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import mySQL from "@/lib/database";
import { getLoggedInUser, createEnrollmentRecord } from "@/lib/queries";

// ! PURCHASE ROUTE

// Sample CCBill configuration
const CCBILL_CONFIG = {
  clientAccountNumber: "123456",
  clientSubAccountNumber: "0000",
  formName: "ccbill-dynamic-form",
  flexformId: "your-flexform-id",
  salt: "your-salt-key",
  testMode: true,
};

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return Response.json({ message: "Unauthorised" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await mySQL(getLoggedInUser, [decoded.userId]);

    if (!users.length) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    const { courseId, amount } = await req.json();
    const purchaseId = uuidv4();

    // Create pending purchase record
    await mySQL(createEnrollmentRecord, [
      purchaseId,
      users[0].id,
      courseId,
      amount,
      "",
      "PAYMENT_PENDING",
    ]);

    // Generate CCBill URL (this would be your actual CCBill integration)
    // const ccBillUrl =
    //   `https://bill.ccbill.com/jpost/signup.cgi?` +
    //   `clientAccnum=${CCBILL_CONFIG.clientAccountNumber}&` +
    //   `clientSubacc=${CCBILL_CONFIG.clientSubAccountNumber}&` +
    //   `formName=${CCBILL_CONFIG.formName}&` +
    //   `flexformId=${CCBILL_CONFIG.flexformId}&` +
    //   `price=${amount}&` +
    //   `currencyCode=840&` + // USD
    //   `formDigest=${generateFormDigest(amount)}&` + // You'd need to implement this
    //   `custom1=${purchaseId}`; // For tracking

    return Response.json({
      purchaseId,
      //   ccBillUrl,
    });
  } catch (error) {
    console.error("Purchase initialization error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
