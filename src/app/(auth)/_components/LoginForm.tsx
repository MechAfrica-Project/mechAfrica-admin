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
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/stores/useAuthStore";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email or phone number is required")
    .transform((val) => val.replace(/\s/g, ""))
    .refine(
      (val) => {
        // Allow email or phone number format
        const isEmail = val.includes("@");
        const isPhone = /^\+?[\d\s-]{10,}$/.test(val.replace(/\s/g, ""));
        return isEmail || isPhone;
      },
      { message: "Please enter a valid email or phone number" }
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);

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
      const success = await login(data.email, data.password);

      if (success) {
        toast.success("Login successful!");
        // Check if there's a redirect parameter
        const redirectTo = searchParams.get("redirect");
        router.push(redirectTo || ROUTES.dashboard);
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full md:w-1/2 p-8 lg:p-16 mb-14 flex flex-col justify-center items-center">
      <div className="max-w-sm w-full space-y-8">
        <div className="flex flex-col items-center space-y-3">
          <Image src={images.mechLogo} alt="mech-logo" />
          <h1 className="text-2xl font-bold text-[#00594C]">
            Welcome MechAfrica Admin
          </h1>
          <p className="text-[#00594C] text-sm">Manage MechAfrica from here</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <InputField
            label="Email or Phone"
            name="email"
            type="text"
            placeholder="admin@mechafrica.com or +233..."
            icon={Mail}
            register={register}
            errors={errors}
          />

          <InputField
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
            className="w-full py-5 rounded-lg font-semibold bg-[#00594C] hover:bg-[#00594cd4] flex items-center justify-center gap-2"
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
