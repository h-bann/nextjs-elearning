"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ? function to monitor user's logged in status throughout the app without resorting to Redux or other state management

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [initialised, setInitialised] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/check");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsLoading(false);
      setInitialised(true);
    }
  };
  const signup = async (userData) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      // If the response is not okay, log more details
      if (!response.ok) {
        try {
          const error = JSON.parse(errorText);
          throw new Error(error.message);
        } catch (e) {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      const data = await response.json();
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: error.message };
    }
  };

  const signin = async (credentials) => {
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  };

  const signout = async () => {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
      });
      setUser(null);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  };

  const updateUser = (newData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...newData,
    }));
  };

  // Provide a way to check if someone is logged in
  const isAuthenticated = !!user;

  // Values to expose to the rest of the app
  const value = {
    user,
    isLoading,
    initialised,
    isAuthenticated,
    signup,
    signin,
    signout,
    updateUser,
    refreshAuth: checkAuth, // Expose this in case we need to manually refresh auth state
  };

  if (!initialised) {
    return null; // Or a loading spinner
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  return useContext(AuthContext);
};

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, isLoading, initialised } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (initialised && !isLoading && !isRedirecting) {
      if (!user) {
        setIsRedirecting(true);
        router.push("/auth/signin");
        return;
      }

      // if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      //   setIsRedirecting(true);
      //   router.push("/dashboard");
      //   return;
      // }
    }
  }, [isLoading, user, allowedRoles, isRedirecting, initialised]);

  if (isLoading || !initialised) {
    return (
      <div className="mt-10 flex w-full flex-wrap content-center justify-center text-center">
        <div className="w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user && (!allowedRoles.length || allowedRoles.includes(user.role))) {
    return children;
  }

  // Return null while redirecting
  return null;
}
