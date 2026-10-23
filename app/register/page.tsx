import Link from "next/link";
import AuthCard from "../../components/auth/AuthCard";
import AuthForm from "../../components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <AuthCard
      label="Nexus AI · Account"
      title="Create your account."
      description="Create an account to keep your own Nexus AI projects in one place."
      footer={<>Already have an account? <Link href="/login" className="text-[#AD5637] hover:text-[#AD5637]">Sign in</Link></>}
    >
      <AuthForm mode="register" />
    </AuthCard>
  );
}
