// app/dashboard/profile/page.jsx
import ProfileForm from "@/components/dashboard/profile/ProfileForm";
import ProfileHeader from "@/components/dashboard/profile/ProfileHeader";
import SecuritySection from "@/components/dashboard/profile/SecuritySection";
import { getServerSession } from "@/lib/serverAuth";
import AccountDeletion from "@/components/dashboard/profile/AccountDeletion";
import DataExport from "@/components/dashboard/profile/DataExport";

export default async function ProfilePage() {
  const user = await getServerSession();

  if (!user) {
    redirect("/auth/signin?redirect=/dashboard/profile");
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <ProfileHeader user={user} />

      <div className="mt-8 grid gap-8">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-6 text-xl font-semibold">Personal Information</h2>
          <ProfileForm user={user} />
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-6 text-xl font-semibold">Security</h2>
          <SecuritySection />
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-6 text-xl font-semibold">Your Data</h2>
          <DataExport userRole={user.role} />
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-6 text-xl font-semibold">Danger Zone</h2>
          <AccountDeletion />
        </div>
      </div>
    </div>
  );
}
