export const url =
  typeof window !== "undefined"
    ? window.location.origin // Use the current domain when in browser
    : process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : process.env.NEXT_PUBLIC_API_URL;
