import Link from "next/link";
import AuthCard from "../../components/auth/AuthCard";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      label="Nexus AI · Account recovery"
      title="Reset your password."
      description="Enter the email address associated with your account. If it exists, we will send a recovery link."
      footer={<Link href="/login" className="text-cyan-400 transition hover:text-cyan-300">Back to sign in</Link>}
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
