import Link from "next/link";
import AuthCard from "../../components/auth/AuthCard";
import AuthForm from "../../components/auth/AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ passwordReset?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthCard
      label="Nexus AI · Account"
      title="Welcome back."
      description="Sign in to access your private dashboard and projects."
      footer={<>Do not have an account? <Link href="/register" className="text-[#D9B77B] hover:text-[#D9B77B]">Create one</Link></>}
    >
      <AuthForm mode="login" showPasswordResetNotice={params.passwordReset === "success"} />
    </AuthCard>
  );
}
