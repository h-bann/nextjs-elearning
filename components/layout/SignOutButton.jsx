// components/layout/SignOutButton.jsx
"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-actions";
import { useTransition } from "react";

export default function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => signOut())}
      disabled={isPending}
      className="group flex items-center space-x-2 text-secondary transition-colors"
    >
      <LogOut className="group-hover:text-accent" size={20} />
      <span className="group-hover:text-accent">
        {isPending ? "Signing out..." : "Sign Out"}
      </span>
    </button>
  );
}
