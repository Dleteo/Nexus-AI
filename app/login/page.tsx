import Link from "next/link";
import AuthCard from "../../components/auth/AuthCard";
import AuthForm from "../../components/auth/AuthForm";

export default function LoginPage() {
  return (
    <AuthCard
      label="Nexus AI · Account"
      title="Welcome back."
      description="Sign in to access your private dashboard and projects."
      footer={<>Do not have an account? <Link href="/register" className="text-cyan-400 hover:text-cyan-300">Create one</Link></>}
    >
      <AuthForm mode="login" />
    </AuthCard>
  );
}
