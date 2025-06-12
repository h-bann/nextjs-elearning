// app/dashboard/profile/page.jsx
import ProfileForm from "@/components/dashboard/profile/ProfileForm";
import ProfileHeader from "@/components/dashboard/profile/ProfileHeader";
import SecuritySection from "@/components/dashboard/profile/SecuritySection";
import VerificationStatus from "@/components/verification/VerificationStatus";
import InstructorStatus from "@/components/verification/InstructorStatus";
import mySQL from "@/lib/database";
import { getAgeVerifiedUser } from "@/lib/queries";
import { getServerSession } from "@/lib/serverAuth";
import AccountDeletion from "@/components/dashboard/profile/AccountDeletion";
import DataExport from "@/components/dashboard/profile/DataExport";

async function getUserWithVerification(userId) {
  const userData = await mySQL(getAgeVerifiedUser, [userId]);
  return userData[0];
}

export default async function ProfilePage() {
  const user = await getServerSession();

  if (!user) {
    redirect("/auth/signin?redirect=/dashboard/profile");
    return null;
  }

  // Get user with verification data
  const userWithVerification = await getUserWithVerification(user.user_id);

  // Check if user is an instructor
  const isInstructor = userWithVerification.role === "instructor";

  return (
    <div className="mx-auto max-w-4xl">
      <ProfileHeader user={userWithVerification} />

      <div className="mt-8 grid gap-8">
        {/* Age Verification Status - Only show for non-instructors */}
        {!isInstructor && (
          <VerificationStatus
            user={userWithVerification}
            verificationData={{
              oneid_verification_date:
                userWithVerification.oneid_verification_date,
            }}
          />
        )}

        {/* Instructor Status - Only show for instructors */}
        {isInstructor && <InstructorStatus user={userWithVerification} />}

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-6 text-xl font-semibold">Personal Information</h2>
          <ProfileForm user={userWithVerification} />
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-6 text-xl font-semibold">Security</h2>
          <SecuritySection />
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-6 text-xl font-semibold">Your Data</h2>
          <DataExport userRole={userWithVerification.role} />
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-6 text-xl font-semibold">Danger Zone</h2>
          <AccountDeletion />
        </div>
      </div>
    </div>
  );
}
