import SmartSectionLayout from "@/components/layouts/SmartSectionLayout";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SmartSectionLayout basePath="/dashboard">{children}</SmartSectionLayout>;
}
