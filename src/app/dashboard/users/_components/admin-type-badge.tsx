import { BookOpenCheck, Shield, ShieldCheck } from "lucide-react";

interface AdminTypeBadgeProps {
  type: string;
}

export function AdminTypeBadge({ type }: AdminTypeBadgeProps) {
  const getTypeStyles = (type: string) => {
    switch (type) {
      case "Admin":
        return "bg-primary/10 text-primary dark:bg-green-900 dark:text-green-200";
      case "Agent":
        return "bg-primary/10 text-primary dark:bg-gray-800 dark:text-gray-200";
      case "Accounting":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200";
      case "Farmer":
        return "bg-primary/20 text-primary dark:bg-blue-900 dark:text-blue-200";
      case "Provider":
        return "bg-primary/20 text-primary dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getDotColor = (type: string) => {
    switch (type) {
      case "Admin":
        return "bg-primary";
      case "Agent":
        return "bg-primary";
      case "Accounting":
        return "bg-amber-500";
      case "Farmer":
        return "bg-primary";
      case "Provider":
        return "bg-primary";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${getTypeStyles(
        type
      )}`}
    >
      <span className={`h-2 w-2 rounded-full ${getDotColor(type)}`} />
      {type} {type === "Admin" ? <ShieldCheck className="w-4 h-4" /> : type === "Agent" ? <Shield className="w-4 h-4" /> : type === "Accounting" ? <BookOpenCheck className="w-4 h-4" /> : ""}    </div>
  );
}
