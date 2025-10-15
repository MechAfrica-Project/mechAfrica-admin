import SmartSectionLayout from "@/components/layouts/SmartSectionLayout";

export default function RequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SmartSectionLayout basePath="/requests">{children}</SmartSectionLayout>;
}
