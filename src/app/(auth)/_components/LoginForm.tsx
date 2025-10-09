import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputField } from "./InputField"; // note: named export, not default

// ✅ Zod schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// ✅ Infer TypeScript type from schema
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Typed useForm
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // ✅ Strongly typed submit handler
  const onSubmit: SubmitHandler<LoginFormValues> = (data) => {
    setIsLoading(true);
    console.log("Logging in with:", data);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  // ✅ Inline SVG component (can be extracted if reused)
  const MechAfricaLogo = () => (
    <svg
      className="w-16 h-16 text-teal-700"
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M50 0 L55 10 C70 10 75 30 70 50 C65 70 50 90 40 100 C30 90 25 70 30 50 C35 30 40 10 50 0 Z"
        fill="#228B22"
      />
      <path d="M50 0 C45 10 55 10 50 20 Z" fill="#38761D" />
    </svg>
  );

  return (
    <div className="w-full md:w-1/2 p-8 lg:p-16 flex flex-col justify-center items-center">
      <div className="max-w-sm w-full space-y-8">
        {/* Logo + Heading */}
        <div className="flex flex-col items-center space-y-3">
          <MechAfricaLogo />
          <h1 className="text-2xl font-semibold text-teal-700">
            Welcome MechAfrica Admin
          </h1>
          <p className="text-gray-500 text-sm">Manage MechAfrica from here</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <InputField<LoginFormValues>
            label="Email"
            name="email"
            type="email"
            placeholder="ephraimi@mechafrica.com"
            icon={Mail}
            register={register}
            errors={errors}
          />

          <InputField<LoginFormValues>
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            register={register}
            errors={errors}
            isPassword
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-semibold bg-teal-700 hover:bg-teal-600"
          >
            {isLoading ? "Logging in..." : "Log in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
