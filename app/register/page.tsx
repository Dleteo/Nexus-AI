import Link from "next/link";
import AuthCard from "../../components/auth/AuthCard";
import AuthForm from "../../components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <AuthCard
      label="Nexus AI · Account"
      title="Create your account."
      description="Create an account to keep your own Nexus AI projects in one place."
      footer={<>Already have an account? <Link href="/login" className="text-[#D9B77B] hover:text-[#D9B77B]">Sign in</Link></>}
    >
      <AuthForm mode="register" />
    </AuthCard>
  );
}
