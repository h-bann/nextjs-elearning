// app/layout.jsx
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

export const metadata = {
  title: "E-learning app",
  description: "E-Learning App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <div className="pt-16">{children}</div>
      </body>
    </html>
  );
}
