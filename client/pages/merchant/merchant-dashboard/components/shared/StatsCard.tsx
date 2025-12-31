import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: string;
  trend?: "up" | "down";
  color?: "blue" | "green" | "purple" | "orange";
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  trend = "up",
  color = "blue",
}: StatsCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
  };

  return (
    <Card className={`border ${colorClasses[color]}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between flex-row-reverse">
          <div className="text-right">
            <p className="text-sm font-medium mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div className="flex items-center gap-1 mt-1 justify-end">
                <span className="text-xs text-gray-500">من الشهر الماضي</span>
                <span
                  className={`text-xs ${trend === "up" ? "text-green-600" : "text-red-600"}`}
                >
                  {change}
                </span>
                {trend === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
              </div>
            )}
          </div>
          <div
            className={`p-3 rounded-full ${colorClasses[color].split(" ")[0]}`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
