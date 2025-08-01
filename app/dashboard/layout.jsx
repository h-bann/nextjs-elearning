import React from "react";
import { cookies } from "next/headers";
import mySQL from "@/lib/database";
import { getLoggedInUser } from "@/lib/queries";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import ResponsiveSidebar from "@/components/dashboard/ResponsiveSidebar";
import { requireAuth } from "@/lib/auth-actions";

export default async function DashboardLayout({ children }) {
  const user = await requireAuth();
  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <ResponsiveSidebar user={user} />

      {/* Main Content */}
      <main className="mt-16 flex-1 p-6 md:mt-1">{children}</main>
    </div>
  );
}
