// components/layout/Navbar.jsx
import Link from "next/link";
import { Menu, LogIn, LogOut } from "lucide-react";
import ClientSideMenu from "./ClientSideMenu";
import SignOutButton from "./SignOutButton"; // We'll create this
import { requireAuth } from "@/lib/auth-actions";

export default async function Navbar() {
  const user = await requireAuth();

  const menuItems = [
    { label: "Home", href: "/" },
    { label: "Courses", href: "/courses" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  // If user is logged in, add dashboard to menu items
  if (user) {
    menuItems.push({ label: "Dashboard", href: "/dashboard" });
  }

  return (
    <nav className="fixed top-0 z-50 w-full bg-primary shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-4xl font-medium text-secondary">
              E-learning platform
            </h1>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden items-center space-x-8 md:flex">
            {/* Navigation Links */}
            <div className="flex space-x-8">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-secondary transition-colors hover:text-accent"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-secondary">
                    Welcome, {user.username}
                  </span>
                  <SignOutButton />
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="flex items-center space-x-2 text-secondary hover:text-accent"
                  >
                    <LogIn size={20} />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="text-charcoal rounded-lg bg-accent px-4 py-2 transition-colors hover:bg-accent-hover"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button - This needs client-side interactivity */}
          <ClientSideMenu menuItems={menuItems} user={user} />
        </div>
      </div>
    </nav>
  );
}
