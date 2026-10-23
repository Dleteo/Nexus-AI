import Link from "next/link";
import AuthCard from "../../components/auth/AuthCard";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthCard
      label="Nexus AI · Secure account"
      title="Choose a new password."
      description="Open this page from the recovery email, then choose a new password for your account."
      footer={<Link href="/login" className="text-cyan-400 transition hover:text-cyan-300">Back to sign in</Link>}
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
