"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, LogIn, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/auth-actions";
import { useTransition } from "react";

export default function ClientSideMenu({ menuItems, user }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleSignOut = () => {
    startTransition(() => signOut());
  };

  return (
    <>
      <button
        onClick={toggleMenu}
        className="mt-2 text-secondary hover:text-accent focus:outline-none md:hidden"
      >
        {isMenuOpen ? <X size={27} /> : <Menu size={27} />}
      </button>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"} pb-4`}>
        <div className="flex flex-col space-y-4">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="py-2 text-secondary transition-colors hover:text-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {/* Mobile Auth Buttons */}
          <div className="space-y-4 border-t border-primary-light pt-4">
            {user ? (
              <>
                <span className="block text-secondary">
                  Welcome, {user.username}
                </span>
                <button
                  onClick={handleSignOut}
                  disabled={isPending}
                  className="flex items-center space-x-2 text-secondary hover:text-accent"
                >
                  <LogOut size={20} />
                  <span className="hover:text-accent">
                    {isPending ? "Signing out..." : "Sign Out"}
                  </span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="flex items-center space-x-2 text-secondary hover:text-accent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn size={20} />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-charcoal inline-block w-full rounded-lg bg-accent px-4 py-2 text-center transition-colors hover:bg-accent-hover"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
