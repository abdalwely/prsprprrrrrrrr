// components/shared/StatsCard.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change?: string;
  trend?: "up" | "down";
  color?: "green" | "blue" | "purple" | "orange" | "red" | "amber";
  description?: string; // أضف هذا السطر
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  trend,
  color = "blue",
  description, // أضف هذا السطر
}: StatsCardProps) {
  const colorClasses = {
    green: "text-green-600 bg-green-100",
    blue: "text-blue-600 bg-blue-100",
    purple: "text-purple-600 bg-purple-100",
    orange: "text-orange-600 bg-orange-100",
    red: "text-red-600 bg-red-100",
    amber: "text-amber-600 bg-amber-100",
  };

  const trendIcon =
    trend === "up" ? (
      <svg
        className="w-4 h-4 text-green-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    ) : trend === "down" ? (
      <svg
        className="w-4 h-4 text-red-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
    ) : null;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
            {/* إضافة الوصف هنا */}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div
            className={`h-12 w-12 rounded-full ${colorClasses[color]} flex items-center justify-center`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {change && trend && (
          <div className="flex items-center mt-4">
            {trendIcon}
            <span
              className={`ml-2 text-sm font-medium ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {change}
            </span>
            <span className="ml-2 text-sm text-muted-foreground">
              عن الشهر الماضي
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
