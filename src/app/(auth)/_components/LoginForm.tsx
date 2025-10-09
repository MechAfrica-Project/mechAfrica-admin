"use client";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { InputField } from "./InputField";
import Image from "next/image";
import { images } from "@/lib/images";
import { useRouter } from "next/navigation";

// ✅ Validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// ✅ Type inference
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsLoading(true);
    toast.info("Logging in...");

    try {
      // simulate login request
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Logging in with:", data);
      toast.success("Login successful!");
      router.push("/dashboard/dashboard")
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full md:w-1/2 p-8 lg:p-16 mb-14 flex flex-col justify-center items-center">
      <div className="max-w-sm w-full space-y-8">
        {/* Logo + Heading */}
        <div className="flex flex-col items-center space-y-3">
          <Image src={images.mechLogo} alt="mech-logo" />
          <h1 className="text-2xl font-bold text-[#00594C]">
            Welcome MechAfrica Admin
          </h1>
          <p className="text-[#00594C] ray-500 text-sm">
            Manage MechAfrica from here
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <InputField<LoginFormValues>
            label="Email"
            name="email"
            type="email"
            placeholder="admin@mechafrica.com"
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
            className="w-full py-5 cursor-pointer rounded-lg font-semibold bg-[#00594C] hover:bg-[#00594cd4] ease-in flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Logging in...
              </>
            ) : (
              "Log in"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
