"use client";

import { usePathname, useSearchParams } from "next/navigation";
import CourseSidebar from "./CourseSidebar";

export default function MobileSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Hydrate the sidebar client-side
  const fetchAndRenderSidebar = async () => {
    const courseId = pathname.split("/")[2];
    const response = await fetch(
      `/api/courses/${courseId}/sidebar?${searchParams.toString()}`
    );
    // Render the sidebar based on the response
  };

  return (
    <div className="md:hidden fixed inset-0 z-40 bg-white">
      {/* Show loading state, then sidebar content */}
    </div>
  );
}
