import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import { Stats } from "../types";
import { StatsCard } from "./shared/StatsCard";

interface OverviewTabProps {
  stats: Stats;
}

export default function OverviewTab({ stats }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="إجمالي المبيعات"
          value={`${stats.totalRevenue.toLocaleString()} ريال`}
          icon={DollarSign}
          change="+12.5%"
          trend="up"
          color="green"
        />
        <StatsCard
          title="الطلبات"
          value={stats.totalOrders}
          icon={ShoppingCart}
          change="+8.2%"
          trend="up"
          color="blue"
        />
        <StatsCard
          title="المنتجات"
          value={stats.totalProducts}
          icon={Package}
          change="+15%"
          trend="up"
          color="purple"
        />
        <StatsCard
          title="العملاء النشطين"
          value={stats.activeCustomers}
          icon={Users}
          change="+24"
          trend="up"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>الأداء الشهري</CardTitle>
            <CardDescription>تحليل المبيعات خلال 6 أشهر</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center bg-muted rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">رسم بياني للأداء</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>المنتجات الأعلى مبيعاً</CardTitle>
            <CardDescription>أفضل 5 منتجات من حيث المبيعات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topSellingProducts.slice(0, 5).map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 hover:bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <span className="font-bold">{index + 1}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-bold">{product.price} ريال</p>
                    <p className="text-sm text-muted-foreground">
                      {product.inventory?.quantity} متبقي
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
