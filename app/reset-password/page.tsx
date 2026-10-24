import Link from "next/link";
import AuthCard from "../../components/auth/AuthCard";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthCard
      label="Nexus AI · Secure account"
      title="Choose a new password."
      description="Open this page from the recovery email, then choose a new password for your account."
      footer={<Link href="/login" className="text-[#D9B77B] transition hover:text-[#D9B77B]">Back to sign in</Link>}
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
