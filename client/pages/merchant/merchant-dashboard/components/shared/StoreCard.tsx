import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  StoreIcon,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Edit,
  ExternalLink,
  ShoppingCart,
} from "lucide-react";
import { ExtendedStore } from "../../types";

interface StoreCardProps {
  store: ExtendedStore;
  stats?: {
    totalOrders: number;
    totalProducts: number;
    activeCustomers: number;
    totalRevenue: number;
  };
  onVisit?: () => void;
  onEdit?: () => void;
}

export function StoreCard({ store, stats, onVisit, onEdit }: StoreCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-row-reverse">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
              <StoreIcon className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <CardTitle>{store.name}</CardTitle>
              <CardDescription>{store.subdomain}.store.com</CardDescription>
            </div>
          </div>
          <Badge variant={store.status === "active" ? "default" : "secondary"}>
            {store.status === "active" ? "نشط" : "غير نشط"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {stats && (
              <>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">الطلبات: {stats.totalOrders}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    المنتجات: {stats.totalProducts}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    العملاء: {stats.activeCustomers}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    الإيرادات: {stats.totalRevenue.toLocaleString()} ر.ي
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 ml-2" />
              تعديل
            </Button>
            <Button size="sm" onClick={onVisit}>
              <ExternalLink className="h-4 w-4 ml-2" />
              زيارة المتجر
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
