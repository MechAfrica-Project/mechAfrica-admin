import SectionLayout from "@/components/layouts/SectionLayout";

export default function RequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SectionLayout basePath="/requests">{children}</SectionLayout>;
}
