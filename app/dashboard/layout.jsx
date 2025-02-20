import React from "react";
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  User,
  GraduationCap,
  PlusCircle,
} from "lucide-react";
import { cookies } from "next/headers";
import mySQL from "@/lib/database";
import { getLoggedInUser } from "@/lib/queries";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

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
  const isInstructor = user.role === "instructor";

  const sidebarItems = [
    {
      icon: LayoutDashboard,
      label: "Overview",
      href: "/dashboard",
    },
    {
      icon: BookOpen,
      label: isInstructor ? "My Courses" : "Enrolled Courses",
      href: "/dashboard/courses",
    },
    ...(isInstructor
      ? [
          {
            icon: PlusCircle,
            label: "Create Course",
            href: "/dashboard/courses/create",
          },
        ]
      : []),
    {
      icon: User,
      label: "Profile",
      href: "/dashboard/profile",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/dashboard/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
        </div>
        <nav className="flex-1 p-4">
          {sidebarItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg p-3 mb-1 transition-colors"
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-medium text-gray-800">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
