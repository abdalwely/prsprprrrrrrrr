import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Activity,
  Truck,
  CheckCircle,
  XCircle,
  PauseCircle,
  FileText,
  HelpCircle,
} from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const configs: Record<
    string,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
      icon: React.ElementType;
    }
  > = {
    pending: { label: "في الانتظار", variant: "secondary", icon: Clock },
    processing: { label: "قيد المعالجة", variant: "default", icon: Activity },
    shipped: { label: "تم الشحن", variant: "default", icon: Truck },
    delivered: { label: "تم التوصيل", variant: "default", icon: CheckCircle },
    cancelled: { label: "ملغي", variant: "destructive", icon: XCircle },
    active: { label: "نشط", variant: "default", icon: CheckCircle },
    inactive: { label: "غير نشط", variant: "secondary", icon: PauseCircle },
    draft: { label: "مسودة", variant: "outline", icon: FileText },
  };

  const config = configs[status] || {
    label: status,
    variant: "outline",
    icon: HelpCircle,
  };
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className="flex items-center gap-1 flex-row-reverse"
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
