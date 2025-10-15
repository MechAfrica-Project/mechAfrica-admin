
import SmartSectionLayout from "@/components/layouts/SmartSectionLayout";

export default function FinancesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SmartSectionLayout basePath="/finances">{children}</SmartSectionLayout>;
}
