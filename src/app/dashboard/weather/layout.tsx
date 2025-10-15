
import SmartSectionLayout from "@/components/layouts/SmartSectionLayout";

export default function WeatherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SmartSectionLayout basePath="/weather">{children}</SmartSectionLayout>;
}
