import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="text-muted-foreground mt-1">Start tracking your finances</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
