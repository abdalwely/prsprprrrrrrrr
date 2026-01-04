import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Loader2,
  Search,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  DollarSign,
  Filter,
  Download,
} from "lucide-react";
import { customerService, orderService } from "@/lib/src";
import { StoreCustomer } from "@/lib/src";
import { getCurrentStoreId } from "@/lib/src/firebase/firebase";

const CustomersTab: React.FC = () => {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<StoreCustomer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<StoreCustomer[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<StoreCustomer | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);

  // حالة إضافة عميل جديد
  const [newCustomer, setNewCustomer] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    notes: "",
  });
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // تحميل العملاء
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);

        // الحصول على storeId الحالي
        const currentStoreId = await getCurrentStoreId();
        setStoreId(currentStoreId);

        if (!currentStoreId) {
          toast({
            title: "لم يتم تحديد متجر",
            description: "يجب تحديد متجر أولاً",
            variant: "destructive",
          });
          return;
        }

        // جلب العملاء من المتجر
        const storeCustomers = await customerService.getByStore(currentStoreId);
        setCustomers(storeCustomers);
        setFilteredCustomers(storeCustomers);
      } catch (error) {
        console.error("❌ خطأ في تحميل العملاء:", error);
        toast({
          title: "خطأ في تحميل العملاء",
          description: "تعذر تحميل قائمة العملاء",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, [toast]);

  // البحث والعملاء
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter(
      (customer) =>
        customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  // إضافة عميل جديد
  const handleAddCustomer = async () => {
    if (!storeId) {
      toast({
        title: "لم يتم تحديد متجر",
        variant: "destructive",
      });
      return;
    }

    if (!newCustomer.email || !newCustomer.firstName) {
      toast({
        title: "بيانات ناقصة",
        description: "الرجاء إدخال البريد الإلكتروني والاسم الأول",
        variant: "destructive",
      });
      return;
    }

    setAddingCustomer(true);
    try {
      // في النظام الجديد، لا ننشئ عملاء يدوياً إلا إذا كانوا مستخدمين مسجلين
      // بدلاً من ذلك، ننشئ سجل زائر أو نربط بمستخدم موجود

      // هذا مثال لإضافة عميل جديد (سيكون ضيفاً)
      toast({
        title: "إضافة عميل",
        description:
          "في النظام الجديد، يتم إنشاء العملاء تلقائياً عند زيارتهم للمتجر",
      });

      // إغلاق الحوار
      setIsAddDialogOpen(false);
      setNewCustomer({
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        notes: "",
      });
    } catch (error) {
      console.error("❌ خطأ في إضافة العميل:", error);
      toast({
        title: "فشل في إضافة العميل",
        description: "تعذر إضافة العميل الجديد",
        variant: "destructive",
      });
    } finally {
      setAddingCustomer(false);
    }
  };

  // عرض تفاصيل العميل
  const handleViewCustomer = async (customer: StoreCustomer) => {
    setSelectedCustomer(customer);
  };

  // تصدير العملاء
  const handleExportCustomers = () => {
    try {
      const csvData = [
        [
          "الاسم",
          "البريد الإلكتروني",
          "الهاتف",
          "آخر زيارة",
          "عدد الطلبات",
          "إجمالي المشتريات",
        ],
        ...filteredCustomers.map((c) => [
          `${c.firstName} ${c.lastName}`,
          c.email,
          c.phone || "",
          c.lastVisit ? new Date(c.lastVisit).toLocaleDateString("ar-SA") : "",
          c.totalOrders || 0,
          c.totalSpent || 0,
        ]),
      ];

      const csvContent = csvData.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `customers_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();

      toast({
        title: "تم التصدير",
        description: `تم تصدير ${filteredCustomers.length} عميل`,
      });
    } catch (error) {
      console.error("❌ خطأ في تصدير العملاء:", error);
      toast({
        title: "خطأ في التصدير",
        variant: "destructive",
      });
    }
  };

  // ترشيح حسب النشاط
  const filterByActivity = (days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filtered = customers.filter((customer) => {
      const lastVisit = new Date(customer.lastVisit);
      return lastVisit >= cutoffDate;
    });

    setFilteredCustomers(filtered);
    setSearchTerm("");
  };

  // إعادة تعيين التصفية
  const resetFilter = () => {
    setFilteredCustomers(customers);
    setSearchTerm("");
  };

  // حساب إجمالي الإيرادات
  const totalRevenue = filteredCustomers.reduce(
    (sum, customer) => sum + (customer.totalSpent || 0),
    0,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي العملاء</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">العملاء النشطين</p>
                <p className="text-2xl font-bold">
                  {customers.filter((c) => c.isActive).length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                <p className="text-2xl font-bold">
                  {customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  إجمالي الإيرادات
                </p>
                <p className="text-2xl font-bold">
                  {totalRevenue.toLocaleString()} ريال
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أدوات التحكم */}
      <Card>
        <CardHeader>
          <CardTitle>إدارة العملاء</CardTitle>
          <CardDescription>
            قائمة جميع عملاء المتجر، يمكنك البحث والتصفية والتحكم
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن عميل بالاسم أو البريد أو الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={resetFilter}>
                الكل
              </Button>

              <Button variant="outline" onClick={() => filterByActivity(30)}>
                <Calendar className="ml-2 h-4 w-4" />
                نشط (٣٠ يوم)
              </Button>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="ml-2 h-4 w-4" />
                    إضافة عميل
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إضافة عميل جديد</DialogTitle>
                    <DialogDescription>
                      أضف عميلاً جديداً للمتجر. في النظام الجديد، يتم إنشاء
                      العملاء تلقائياً عند زيارتهم.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer-email">
                        البريد الإلكتروني *
                      </Label>
                      <Input
                        id="customer-email"
                        type="email"
                        placeholder="customer@example.com"
                        value={newCustomer.email}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customer-firstName">
                          الاسم الأول *
                        </Label>
                        <Input
                          id="customer-firstName"
                          value={newCustomer.firstName}
                          onChange={(e) =>
                            setNewCustomer({
                              ...newCustomer,
                              firstName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customer-lastName">اسم العائلة</Label>
                        <Input
                          id="customer-lastName"
                          value={newCustomer.lastName}
                          onChange={(e) =>
                            setNewCustomer({
                              ...newCustomer,
                              lastName: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customer-phone">رقم الهاتف</Label>
                      <Input
                        id="customer-phone"
                        type="tel"
                        placeholder="+967 XXX XXX XXX"
                        value={newCustomer.phone}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customer-notes">ملاحظات</Label>
                      <textarea
                        id="customer-notes"
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="ملاحظات حول العميل..."
                        value={newCustomer.notes}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            notes: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      إلغاء
                    </Button>
                    <Button
                      onClick={handleAddCustomer}
                      disabled={addingCustomer}
                    >
                      {addingCustomer ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          جاري الإضافة...
                        </>
                      ) : (
                        "إضافة العميل"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={handleExportCustomers}>
                <Download className="ml-2 h-4 w-4" />
                تصدير
              </Button>
            </div>
          </div>

          {/* جدول العملاء */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العميل</TableHead>
                  <TableHead>معلومات التواصل</TableHead>
                  <TableHead>آخر زيارة</TableHead>
                  <TableHead>الطلبات</TableHead>
                  <TableHead>إجمالي المشتريات</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {searchTerm ? "لا توجد نتائج للبحث" : "لا يوجد عملاء بعد"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.uid}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {customer.firstName} {customer.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {customer.uid.substring(0, 8)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{customer.email}</span>
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{customer.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(customer.lastVisit).toLocaleDateString(
                              "ar-SA",
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(customer.lastVisit).toLocaleTimeString(
                            "ar-SA",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-3 w-3 text-muted-foreground" />
                          <span>{customer.totalOrders || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {(customer.totalSpent || 0).toLocaleString()} ريال
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={customer.isActive ? "default" : "secondary"}
                        >
                          {customer.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCustomer(customer)}
                        >
                          عرض التفاصيل
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* ملخص التصفية */}
          {searchTerm && (
            <div className="mt-4 text-sm text-muted-foreground">
              عرض {filteredCustomers.length} من أصل {customers.length} عميل
            </div>
          )}
        </CardContent>
      </Card>

      {/* تفاصيل العميل المحدد */}
      {selectedCustomer && (
        <Dialog
          open={!!selectedCustomer}
          onOpenChange={(open) => !open && setSelectedCustomer(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>تفاصيل العميل</DialogTitle>
              <DialogDescription>
                معلومات كاملة عن العميل وتاريخ مشترياته
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* المعلومات الأساسية */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">المعلومات الشخصية</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الاسم:</span>
                      <span className="font-medium">
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">البريد:</span>
                      <span>{selectedCustomer.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الهاتف:</span>
                      <span>{selectedCustomer.phone || "غير محدد"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        معرف العميل:
                      </span>
                      <span className="font-mono text-xs">
                        {selectedCustomer.uid}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">النشاط</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        تاريخ التسجيل:
                      </span>
                      <span>
                        {new Date(
                          selectedCustomer.firstVisit,
                        ).toLocaleDateString("ar-SA")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">آخر زيارة:</span>
                      <span>
                        {new Date(
                          selectedCustomer.lastVisit,
                        ).toLocaleDateString("ar-SA")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">آخر طلب:</span>
                      <span>
                        {selectedCustomer.lastOrderAt
                          ? new Date(
                              selectedCustomer.lastOrderAt,
                            ).toLocaleDateString("ar-SA")
                          : "لا يوجد طلبات"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الحالة:</span>
                      <Badge
                        variant={
                          selectedCustomer.isActive ? "default" : "secondary"
                        }
                      >
                        {selectedCustomer.isActive ? "نشط" : "غير نشط"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* الإحصائيات */}
              <div>
                <h4 className="font-medium mb-3">إحصائيات المشتريات</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">
                        إجمالي الطلبات
                      </p>
                      <p className="text-2xl font-bold">
                        {selectedCustomer.totalOrders || 0}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">
                        إجمالي المشتريات
                      </p>
                      <p className="text-2xl font-bold">
                        {(selectedCustomer.totalSpent || 0).toLocaleString()}{" "}
                        ريال
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">
                        متوسط قيمة الطلب
                      </p>
                      <p className="text-2xl font-bold">
                        {selectedCustomer.totalOrders
                          ? (
                              (selectedCustomer.totalSpent || 0) /
                              selectedCustomer.totalOrders
                            ).toLocaleString()
                          : 0}{" "}
                        ريال
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">
                        أيام منذ آخر زيارة
                      </p>
                      <p className="text-2xl font-bold">
                        {Math.floor(
                          (new Date().getTime() -
                            new Date(selectedCustomer.lastVisit).getTime()) /
                            (1000 * 60 * 60 * 24),
                        )}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              {/* عنوان الشحن */}
              {selectedCustomer.shippingAddress && (
                <div>
                  <h4 className="font-medium mb-2">عنوان الشحن</h4>
                  <div className="text-sm bg-gray-50 p-4 rounded-md">
                    <p>{selectedCustomer.shippingAddress.street}</p>
                    <p>
                      {selectedCustomer.shippingAddress.city}،
                      {selectedCustomer.shippingAddress.district &&
                        `. ${selectedCustomer.shippingAddress.district}`}
                      {selectedCustomer.shippingAddress.governorate}
                    </p>
                    <p>
                      {selectedCustomer.shippingAddress.country}
                      {selectedCustomer.shippingAddress.zipCode &&
                        `، ${selectedCustomer.shippingAddress.zipCode}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CustomersTab;
