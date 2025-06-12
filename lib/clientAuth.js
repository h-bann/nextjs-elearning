// "use client";

// import { createContext, useContext, useState, useEffect } from "react";
// import { useRouter, usePathname } from "next/navigation";

// const AuthContext = createContext({});

// const protectedRoutes = [
//   { pattern: /^\/dashboard($|\/)/, roles: [] },
//   { pattern: /^\/dashboard\/courses\/create($|\/)/, roles: ["instructor"] },
//   { pattern: /^\/courses\/.*\/learn($|\/)/, roles: [] },
// ];

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const router = useRouter();
//   const pathname = usePathname();

//   // Check auth status on component mount and route changes
//   useEffect(() => {
//     checkAuth();
//   }, []);

//   // Additional protection for client-side route changes
//   useEffect(() => {
//     if (!loading) {
//       checkRoutePermission(pathname);
//     }
//   }, [pathname, user, loading]);

//   // Check if user can access the current route
//   const checkRoutePermission = (path) => {
//     // Find if current path matches any protected pattern
//     const protectedRoute = protectedRoutes.find((route) =>
//       route.pattern.test(path),
//     );

//     if (!protectedRoute) return; // Not protected

//     // If protected and no user, redirect to login
//     if (!user) {
//       router.push(`/auth/signin?redirect=${encodeURIComponent(path)}`);
//       return;
//     }

//     // If role restrictions and user doesn't have permission
//     if (
//       protectedRoute.roles.length > 0 &&
//       !protectedRoute.roles.includes(user.role)
//     ) {
//       router.push("/dashboard");
//     }
//   };

//   // Check authentication status
//   const checkAuth = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch("/api/auth/check");
//       const data = await response.json();

//       if (response.ok && data.user) {
//         setUser(data.user);
//       } else {
//         setUser(null);
//       }
//     } catch (err) {
//       console.error("Auth check error:", err);
//       setError("Authentication failed");
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Sign in
//   const signin = async (credentials) => {
//     try {
//       setLoading(true);
//       const response = await fetch("/api/auth/signin", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(credentials),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         // Check if it's a verification issue
//         if (response.status === 403 && data.needsVerification) {
//           setError("Please verify your email before signing in");
//           return {
//             success: false,
//             error: data.message,
//             needsVerification: true,
//             email: data.email,
//           };
//         }

//         throw new Error(data.message || "Authentication failed");
//       }

//       setUser(data.user);
//       return { success: true, user: data.user };
//     } catch (err) {
//       setError(err.message);
//       return { success: false, error: err.message };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Sign out
//   const signout = async () => {
//     try {
//       setLoading(true);
//       await fetch("/api/auth/signout", { method: "POST" });
//       setUser(null);
//       router.push("/");
//       return { success: true };
//     } catch (err) {
//       setError(err.message);
//       return { success: false, error: err.message };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Sign up
//   const signup = async (userData) => {
//     try {
//       setLoading(true);
//       const response = await fetch("/api/auth/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(userData),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Registration failed");
//       }

//       // Check if verification is required
//       if (data.success && data.requireVerification) {
//         // Don't set the user yet - they need to verify first
//         return {
//           success: true,
//           requireVerification: true,
//           message: data.message,
//           email: userData.email,
//         };
//       }

//       // If no verification required or auto-login (for backward compatibility)
//       if (data.user) {
//         setUser(data.user);
//       }

//       return { success: true, user: data.user, message: data.message };
//     } catch (err) {
//       setError(err.message);
//       return { success: false, error: err.message };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update user profile
//   const updateUser = (userData) => {
//     if (user) {
//       setUser({ ...user, ...userData });
//     }
//   };

//   // Context value
//   const value = {
//     user,
//     loading,
//     error,
//     isAuthenticated: !!user,
//     hasRole: (roles) => {
//       if (!user) return false;
//       return Array.isArray(roles)
//         ? roles.includes(user.role)
//         : user.role === roles;
//     },
//     signin,
//     signout,
//     signup,
//     updateUser,
//     refreshAuth: checkAuth,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// // Hook to use auth context
// export const useAuth = () => useContext(AuthContext);

// // Client component to protect routes
// export function ProtectedRoute({ children, allowedRoles = [] }) {
//   const { user, loading, hasRole } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!loading && !user) {
//       router.push("/auth/signin");
//     } else if (!loading && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
//       router.push("/dashboard");
//     }
//   }, [user, loading, router, allowedRoles, hasRole]);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (!user) {
//     return null;
//   }

//   if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
//     return null;
//   }

//   return children;
// }
