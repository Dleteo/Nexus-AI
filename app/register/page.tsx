import Button from "../../components/ui/Button";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-8">
        <p className="mb-3 text-sm uppercase tracking-[0.35em] text-cyan-400">
          Register
        </p>

        <h1 className="text-4xl font-bold tracking-tight">
          Create your account.
        </h1>

        <p className="mt-4 text-gray-400">
          Join Nexus AI and start building with modern AI-powered tools.
        </p>

        <form className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Full name
            </label>

            <input
              type="text"
              placeholder="Joshua Vallejo Sanchez"
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Email
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400"
            />
          </div>

          <Button className="w-full">Create Account</Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="text-cyan-400 hover:text-cyan-300">
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}