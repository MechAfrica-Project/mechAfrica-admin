import SectionLayout from "@/components/layouts/SectionLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SectionLayout basePath="/dashboard">{children}</SectionLayout>;
}
