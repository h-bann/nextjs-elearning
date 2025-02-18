"use client";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

// ? function to monitor user's logged in status throughout the app without resorting to Redux or other state management

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    setIsLoggedIn(!!token);
    setUserRole(userRole);
    setIsLoading(false);
  }, []);

  const login = (token, userRole) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", userRole);
    setIsLoggedIn(true);
    setUserRole(userRole);
    userRole !== "MainAdmin" ? router.push("/") : router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setIsLoggedIn(false);
    setUserRole(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, isLoading, userRole, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};

export function ProtectedRoute({ children, allowedUserRoles }) {
  const { isLoggedIn, isLoading, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push("/"); // Redirect unauthenticated users
      } else if (allowedUserRoles && !allowedUserRoles.includes(userRole)) {
        router.push("/"); // Redirect if role is not allowed
      }
    }
  }, [isLoading, isLoggedIn, userRole, allowedUserRoles, router]);

  if (isLoading) {
    return (
      <div className="mt-10 flex w-full flex-wrap content-center justify-center text-center font-poppins">
        Loading...
      </div>
    );
  }

  return isLoggedIn &&
    (!allowedUserRoles || allowedUserRoles.includes(userRole))
    ? children
    : null;
}
