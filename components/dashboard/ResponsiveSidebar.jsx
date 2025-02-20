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
      <aside className="hidden md:flex w-64 flex-col bg-white border-r ">
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

      {/* Mobile Dropdown - Only visible on mobile */}
      <div className="md:hidden">
        {/* Fixed position container for toggle button */}
        <div className="fixed top-16 left-0 right-0 bg-white border-b z-30">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full p-4 flex items-center justify-between text-gray-800"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
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
          className={`fixed left-0 right-0 bg-white border-b shadow-lg z-20 transition-all duration-300 ease-in-out ${
            isDropdownOpen
              ? "top-32 opacity-100 visible"
              : "top-0 opacity-0 invisible"
          }`}
        >
          <nav className="py-2">
            {sidebarItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                onClick={() => setIsDropdownOpen(false)}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <div className="p-4 border-t bg-gray-50">
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
        </div>

        {/* Spacer to prevent content from going under the fixed header */}
        <div className="h-32" />
      </div>
    </>
  );
}
