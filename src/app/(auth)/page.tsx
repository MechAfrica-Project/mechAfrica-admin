import { Suspense } from "react";
import LoginForm from "./_components/LoginForm";
import SidebarImage from "./_components/SidebarImage";
import { Loader2 } from "lucide-react";

function LoginFormWrapper() {
  return (
    <Suspense
      fallback={
        <div className="w-full md:w-1/2 p-8 lg:p-16 mb-14 flex flex-col justify-center items-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#00594C]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex w-full bg-[#FDFFE0] h-screen">
      {/* Decorative bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#FCFF3B]" />

      {/* Left: Form */}
      <LoginFormWrapper />

      {/* Right: Image */}
      <SidebarImage />
    </div>
  );
}
