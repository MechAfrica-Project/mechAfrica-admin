import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  FieldErrors,
  UseFormRegister,
  Path,
  FieldValues,
} from "react-hook-form";

interface InputFieldProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  icon?: React.ElementType;
  type?: string;
  isPassword?: boolean;
  placeholder?: string;
}

export function InputField<T extends FieldValues>({
  label,
  name,
  register,
  errors,
  icon: Icon,
  type = "text",
  isPassword = false,
  placeholder,
}: InputFieldProps<T>) {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  const fieldError = errors[name];
  const errorMessage =
    typeof fieldError?.message === "string"
      ? fieldError.message
      : undefined;

  return (
    <div className="space-y-2 w-full">
      <Label htmlFor={String(name)} className="text-gray-700">
        {label}
      </Label>

      <div className="relative flex items-center">
        {Icon && (
          <Icon className="absolute left-3 text-gray-400 w-5 h-5 pointer-events-none" />
        )}

        <Input
          id={String(name)}
          type={inputType}
          placeholder={placeholder}
          {...register(name)}
          className={`pl-10 pr-10 py-2 border-gray-300 focus:ring-2 focus:ring-teal-500 rounded-xl ${
            errorMessage ? "border-red-500" : ""
          }`}
        />

        {isPassword && (
          <Button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            variant="ghost"
            size="icon"
            className="absolute right-3 text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
        )}
      </div>

      {errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}
    </div>
  );
}
