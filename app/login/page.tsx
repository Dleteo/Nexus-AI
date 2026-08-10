import AuthCard from "../../components/auth/AuthCard";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function LoginPage() {
  return (
    <AuthCard
      label="Login"
      title="Welcome back."
      description="Sign in to access your Nexus AI dashboard."
      footer={
        <>
          Do not have an account?{" "}
          <a href="/register" className="text-cyan-400 hover:text-cyan-300">
            Create one
          </a>
        </>
      }
    >
      <form className="space-y-5">
        <Input label="Email" type="email" placeholder="you@example.com" />

        <Input label="Password" type="password" placeholder="••••••••" />

        <Button className="w-full">Sign In</Button>
      </form>
    </AuthCard>
  );
}