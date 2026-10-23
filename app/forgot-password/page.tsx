import Link from "next/link";
import AuthCard from "../../components/auth/AuthCard";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      label="Nexus AI · Account recovery"
      title="Reset your password."
      description="Enter the email address associated with your account. If it exists, we will send a recovery link."
      footer={<Link href="/login" className="text-[#AD5637] transition hover:text-[#AD5637]">Back to sign in</Link>}
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
