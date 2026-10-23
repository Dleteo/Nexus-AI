import Link from "next/link";
import AuthCard from "../../components/auth/AuthCard";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthCard
      label="Nexus AI · Secure account"
      title="Choose a new password."
      description="Open this page from the recovery email, then choose a new password for your account."
      footer={<Link href="/login" className="text-[#AD5637] transition hover:text-[#AD5637]">Back to sign in</Link>}
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
