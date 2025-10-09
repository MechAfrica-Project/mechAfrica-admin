import LoginForm from "./_components/LoginForm";
import SidebarImage from "./_components/SidebarImage";

export default function LoginPage() {
  return (
    <div className="relative flex w-full bg-[#FDFFE0] h-screen">
      {/* Decorative bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#FCFF3B]" />

      {/* Left: Form */}
      <LoginForm />

      {/* Right: Image */}
      <SidebarImage />
    </div>
  );
}
