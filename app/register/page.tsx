import AuthCard from "../../components/auth/AuthCard";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function RegisterPage() {
  return (
    <AuthCard
      label="Register"
      title="Create your account."
      description="Join Nexus AI and start building with modern AI-powered tools."
      footer={
        <>
          Already have an account?{" "}
          <a href="/login" className="text-cyan-400 hover:text-cyan-300">
            Sign in
          </a>
        </>
      }
    >
      <form className="space-y-5">
        <Input
          label="Full name"
          type="text"
          placeholder="Joshua Vallejo Sanchez"
        />

        <Input label="Email" type="email" placeholder="you@example.com" />

        <Input label="Password" type="password" placeholder="••••••••" />

        <Button className="w-full">Create Account</Button>
      </form>
    </AuthCard>
  );
}