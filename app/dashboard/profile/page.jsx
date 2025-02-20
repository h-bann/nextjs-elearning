import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import ProfileForm from "@/components/dashboard/profile/ProfileForm";
import ProfileHeader from "@/components/dashboard/profile/ProfileHeader";
import SecuritySection from "@/components/dashboard/profile/SecuritySection";
import mySQL from "@/lib/database";
import { getLoggedInUser } from "@/lib/queries";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/auth/signin");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await mySQL(getLoggedInUser, [decoded.userId]);

    return users[0];
  } catch (error) {
    redirect("/auth/signin");
  }
}

export default async function ProfilePage() {
  const user = await getUser();

  return (
    <div className="max-w-4xl mx-auto">
      <ProfileHeader user={user} />

      <div className="mt-8 grid gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
          <ProfileForm user={user} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Security</h2>
          <SecuritySection />
        </div>
      </div>
    </div>
  );
}
