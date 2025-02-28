"use client";
import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  User,
  GraduationCap,
  PlusCircle,
} from "lucide-react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ResponsiveSidebar({ user }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="fixed top-16 hidden h-[calc(100vh-4rem)] w-64 flex-col border-r bg-white md:flex">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          {sidebarItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="mb-1 flex items-center space-x-3 rounded-lg p-3 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="mt-auto border-t p-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-medium text-gray-800">{user?.username}</p>
              <p className="text-sm text-gray-500">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Add a spacer div for content placement when sidebar is visible */}
      <div className="hidden w-64 md:block"></div>

      {/* Mobile Dropdown - Only visible on mobile */}
      <div className="md:hidden">
        {/* Fixed position container for toggle button */}
        <div className="fixed left-0 right-0 top-16 z-30 border-b bg-white">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex w-full items-center justify-between p-4 text-gray-800"
          >
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm">
                {user?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="font-medium">My Dashboard</span>
            </div>
            {isDropdownOpen ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </button>
        </div>

        {/* Dropdown Content with transition */}
        <div
          className={`fixed left-0 right-0 z-20 border-b bg-white shadow-lg transition-all duration-300 ease-in-out ${
            isDropdownOpen
              ? "visible top-32 opacity-100"
              : "invisible top-0 opacity-0"
          }`}
        >
          <nav className="py-2">
            {sidebarItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                onClick={() => setIsDropdownOpen(false)}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <div className="border-t bg-gray-50 p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                {user?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-medium text-gray-800">{user?.username}</p>
                <p className="text-sm text-gray-500">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer to prevent content from going under the fixed header */}
        <div className="h-32" />
      </div>
    </>
  );
}
