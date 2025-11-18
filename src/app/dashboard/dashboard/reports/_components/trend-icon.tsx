import { TrendingUp, TrendingDown } from "lucide-react";

interface TrendIconProps {
  isPositive: boolean;
}

export function TrendIcon({ isPositive }: TrendIconProps) {
  if (isPositive) {
    return <TrendingUp className="w-4 h-4 text-green-600" strokeWidth={2.5} />;
  }

  return <TrendingDown className="w-4 h-4 text-red-600" strokeWidth={2.5} />;
}
