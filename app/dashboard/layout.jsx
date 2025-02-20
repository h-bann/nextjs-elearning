import React from "react";

import { cookies } from "next/headers";
import mySQL from "@/lib/database";
import { getLoggedInUser } from "@/lib/queries";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import ResponsiveSidebar from "@/components/dashboard/ResponsiveSidebar";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");

  if (!token) {
    redirect("/auth/signin");
  }

  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const users = await mySQL(getLoggedInUser, [decoded.userId]);
    if (!users[0]) {
      redirect("/auth/signin");
    }

    return users[0];
  } catch (error) {
    redirect("/auth/signin");
  }
}

export default async function DashboardLayout({ children }) {
  const user = await getUser();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <ResponsiveSidebar user={user} />

      {/* Main Content */}
      <main className="flex-1 p-6 mt-16 md:mt-1">{children}</main>
    </div>
  );
}
