import SectionLayout from "@/components/layouts/SectionLayout";

export default function WeatherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SectionLayout basePath="/weather">{children}</SectionLayout>;
}
