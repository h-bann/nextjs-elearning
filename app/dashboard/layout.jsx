import React from "react";
import { redirect } from "next/navigation";
import ResponsiveSidebar from "@/app/dashboard/components/ResponsiveSidebar";
import { requireAuth } from "@/lib/auth/auth-actions";

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
