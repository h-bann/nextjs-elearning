import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { AuthProvider } from "@/lib/clientAuth";

export const metadata = {
  title: "E-Learning App",
  description: "E-Learning App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          {/* Add padding-top to account for fixed navbar */}
          <div className="pt-16">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
