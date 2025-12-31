import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel = "إضافة جديد",
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        {icon && <div className="mb-4">{icon}</div>}
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        {onAction && (
          <Button onClick={onAction}>
            <Plus className="h-4 w-4 ml-2" />
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
