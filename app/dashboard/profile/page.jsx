import ProfileForm from "@/app/dashboard/components/profile/ProfileForm";
import ProfileHeader from "@/app/dashboard/components/profile/ProfileHeader";
import SecuritySection from "@/app/dashboard/components/profile/SecuritySection";
import AccountDeletion from "@/app/dashboard/components/profile/AccountDeletion";
import DataExport from "@/app/dashboard/components/profile/DataExport";
import { requireAuth } from "@/lib/auth/auth-actions";

export default async function ProfilePage() {
  const user = await requireAuth();

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
