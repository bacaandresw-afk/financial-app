import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-muted-foreground mt-1">Sign in to your account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
