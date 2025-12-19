import SmartSectionLayout from "@/components/layouts/SmartSectionLayout";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SmartSectionLayout basePath="/onboarding">{children}</SmartSectionLayout>;
}
