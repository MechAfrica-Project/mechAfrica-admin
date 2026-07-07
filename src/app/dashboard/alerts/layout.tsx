import SmartSectionLayout from "@/components/layouts/SmartSectionLayout";

export default function AlertsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SmartSectionLayout basePath="/alerts">{children}</SmartSectionLayout>;
}
