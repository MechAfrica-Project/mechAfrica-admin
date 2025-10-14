import SectionLayout from "@/components/layouts/SectionLayout";

export default function FinancesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SectionLayout basePath="/finances">{children}</SectionLayout>;
}
