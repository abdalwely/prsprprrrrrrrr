// AdminStoreApprovals.tsx - مكون إدارة موافقات المتاجر المحدث
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { adminService, StoreApplication } from "@/lib/adminService";
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  Store,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Loader2,
  ArrowLeft,
  Search,
  Filter,
  Palette,
  LayoutTemplate, // ⭐ تغيير من Template إلى LayoutTemplate
  Globe,
  Check,
  MessageSquare,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminStoreApprovals() {
  const [applications, setApplications] = useState<StoreApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    StoreApplication[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<StoreApplication | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">(
    "approve",
  );
  const [reviewNotes, setReviewNotes] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadStoreApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const loadStoreApplications = async () => {
    try {
      const apps = await adminService.getStoreApplications();
      setApplications(apps);
    } catch (error) {
      console.error("Error loading applications:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل طلبات المتاجر",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // فلترة حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.storeConfig.storeName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.merchantData.firstName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.merchantData.lastName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.merchantData.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    // فلترة حسب الحالة
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  };

  const openReviewDialog = (
    application: StoreApplication,
    action: "approve" | "reject",
  ) => {
    setSelectedApp(application);
    setReviewAction(action);
    setReviewNotes("");
    setReviewDialogOpen(true);
  };

  const openDetailDialog = (application: StoreApplication) => {
    setSelectedApp(application);
    setDetailDialogOpen(true);
  };

  const handleReview = async () => {
    if (!selectedApp) return;

    setProcessing(selectedApp.id);
    try {
      if (reviewAction === "approve") {
        await adminService.approveStoreApplication(
          selectedApp.id,
          selectedApp,
          reviewNotes,
        );
        toast({
          title: "تمت الموافقة",
          description: "تم إنشاء المتجر بنجاح",
        });
      } else {
        await adminService.rejectStoreApplication(selectedApp.id, reviewNotes);
        toast({
          title: "تم الرفض",
          description: "تم رفض طلب المتجر",
        });
      }

      // تحديث القائمة
      await loadStoreApplications();
      setReviewDialogOpen(false);
    } catch (error) {
      console.error("Error processing application:", error);
      toast({
        title: "خطأ",
        description:
          error instanceof Error ? error.message : "فشل في معالجة الطلب",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 ml-1" />
            في انتظار المراجعة
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 ml-1" />
            تمت الموافقة
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 ml-1" />
            مرفوض
          </Badge>
        );
      case "in_review":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Eye className="h-3 w-3 ml-1" />
            قيد المراجعة
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل طلبات المتاجر...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              <Store className="inline h-8 w-8 ml-2" />
              طلبات إنشاء المتاجر
            </h1>
            <p className="text-gray-600 mt-2">
              مراجعة وموافقة على طلبات إنشاء المتاجر الجديدة - النظام الموحد
            </p>
          </div>
          <Link to="/admin/dashboard">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة للوحة التحكم
            </Button>
          </Link>
        </div>

        {/* فلترة وبحث */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="بحث باسم المتجر، المالك، أو البريد الإلكتروني..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 ml-2" />
                    <SelectValue placeholder="فلترة حسب الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="in_review">قيد المراجعة</SelectItem>
                    <SelectItem value="approved">تمت الموافقة</SelectItem>
                    <SelectItem value="rejected">مرفوض</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={loadStoreApplications} variant="outline">
                <Loader2
                  className={`h-4 w-4 ml-2 ${loading ? "animate-spin" : ""}`}
                />
                تحديث
              </Button>
            </div>
          </CardContent>
        </Card>

        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                لا توجد طلبات حالياً
              </h3>
              <p className="text-gray-600">
                {applications.length === 0
                  ? "لا توجد طلبات إنشاء متاجر"
                  : "لا توجد طلبات تطابق معايير البحث"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredApplications.map((application) => (
              <Card
                key={application.id}
                className="hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg truncate">
                      {application.storeConfig.storeName}
                    </CardTitle>
                    {getStatusBadge(application.status)}
                  </div>
                  <CardDescription className="truncate">
                    {application.storeConfig.storeDescription}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* معلومات التاجر */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="truncate">
                        {application.merchantData.firstName}{" "}
                        {application.merchantData.lastName}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="truncate">
                        {application.merchantData.email}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span>{application.merchantData.phone}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span>{application.merchantData.city}</span>
                    </div>
                  </div>

                  {/* معلومات القالب */}
                  {application.selectedTemplate && (
                    <div className="border-t pt-3">
                      <h4 className="font-medium mb-2 flex items-center">
                        <LayoutTemplate className="h-4 w-4 ml-2" />{" "}
                        {/* ⭐ تحديث هنا */}
                        القالب المختار
                      </h4>
                      <div className="flex items-center space-x-2">
                        <LayoutTemplate className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">
                          {application.selectedTemplate.name.ar}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {application.selectedTemplate.category}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* الألوان المختارة */}
                  {application.storeConfig.customization?.colors &&
                    Object.keys(application.storeConfig.customization.colors)
                      .length > 0 && (
                      <div className="border-t pt-3">
                        <h4 className="font-medium mb-2 flex items-center">
                          <Palette className="h-4 w-4 ml-2" />
                          الألوان المختارة
                        </h4>
                        <div className="flex space-x-2">
                          {Object.entries(
                            application.storeConfig.customization.colors,
                          ).map(
                            ([key, color]) =>
                              color && (
                                <div key={key} className="text-center">
                                  <div
                                    className="w-6 h-6 rounded-full border border-gray-300 mb-1"
                                    style={{ backgroundColor: color as string }}
                                    title={`${key}: ${color}`}
                                  />
                                  <span className="text-xs text-gray-600">
                                    {key}
                                  </span>
                                </div>
                              ),
                          )}
                        </div>
                      </div>
                    )}

                  {/* الملاحظات */}
                  {application.reviewNotes && (
                    <div className="border-t pt-3">
                      <h4 className="font-medium mb-2 flex items-center">
                        <MessageSquare className="h-4 w-4 ml-2" />
                        ملاحظات المراجعة
                      </h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {application.reviewNotes}
                      </p>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="border-t pt-4">
                  <div className="flex justify-between w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetailDialog(application)}
                    >
                      <Eye className="h-4 w-4 ml-2" />
                      التفاصيل
                    </Button>

                    {application.status === "pending" && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() =>
                            openReviewDialog(application, "approve")
                          }
                        >
                          <CheckCircle className="h-4 w-4 ml-2" />
                          موافقة
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() =>
                            openReviewDialog(application, "reject")
                          }
                        >
                          <XCircle className="h-4 w-4 ml-2" />
                          رفض
                        </Button>
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* مودال التفاصيل */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            {selectedApp && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <Store className="h-5 w-5 ml-2" />
                    {selectedApp.storeConfig.storeName}
                  </DialogTitle>
                  <DialogDescription>تفاصيل طلب إنشاء المتجر</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* معلومات التاجر */}
                  <div>
                    <h3 className="font-semibold mb-3">معلومات التاجر</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-500">
                          الاسم الكامل
                        </label>
                        <p className="font-medium">
                          {selectedApp.merchantData.firstName}{" "}
                          {selectedApp.merchantData.lastName}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">
                          البريد الإلكتروني
                        </label>
                        <p className="font-medium">
                          {selectedApp.merchantData.email}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">الهاتف</label>
                        <p className="font-medium">
                          {selectedApp.merchantData.phone}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">المدينة</label>
                        <p className="font-medium">
                          {selectedApp.merchantData.city}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">
                          نوع النشاط
                        </label>
                        <p className="font-medium capitalize">
                          {selectedApp.merchantData.businessType}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">
                          اسم المنشأة
                        </label>
                        <p className="font-medium">
                          {selectedApp.merchantData.businessName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* معلومات المتجر */}
                  <div>
                    <h3 className="font-semibold mb-3">معلومات المتجر</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-500">
                          اسم المتجر
                        </label>
                        <p className="font-medium">
                          {selectedApp.storeConfig.storeName}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">
                          وصف المتجر
                        </label>
                        <p className="font-medium">
                          {selectedApp.storeConfig.storeDescription}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">
                          تاريخ التقديم
                        </label>
                        <p className="font-medium">
                          {new Date(selectedApp.submittedAt).toLocaleDateString(
                            "ar-SA",
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">الحالة</label>
                        <div className="mt-1">
                          {getStatusBadge(selectedApp.status)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* معلومات القالب */}
                  {selectedApp.selectedTemplate && (
                    <div>
                      <h3 className="font-semibold mb-3">معلومات القالب</h3>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-start space-x-4">
                            <img
                              src={selectedApp.selectedTemplate.thumbnail}
                              alt={selectedApp.selectedTemplate.name.ar}
                              className="w-24 h-24 object-cover rounded-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src =
                                  "https://via.placeholder.com/100x100?text=Template";
                              }}
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">
                                {selectedApp.selectedTemplate.name.ar}
                              </h4>
                              <p className="text-gray-600 text-sm mt-1">
                                {selectedApp.selectedTemplate.description.ar}
                              </p>
                              <div className="flex items-center space-x-2 mt-3">
                                <Badge variant="outline">
                                  {selectedApp.selectedTemplate.category}
                                </Badge>
                                <Badge variant="outline">
                                  {selectedApp.selectedTemplate.industry}
                                </Badge>
                                <Badge
                                  variant={
                                    selectedApp.selectedTemplate.isPremium
                                      ? "default"
                                      : "outline"
                                  }
                                >
                                  {selectedApp.selectedTemplate.isPremium
                                    ? "متميز"
                                    : "مجاني"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDetailDialogOpen(false)}
                  >
                    إغلاق
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* مودال المراجعة */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {reviewAction === "approve"
                  ? "الموافقة على طلب المتجر"
                  : "رفض طلب المتجر"}
              </DialogTitle>
              <DialogDescription>
                {reviewAction === "approve"
                  ? "سيتم إنشاء المتجر وتفعيل حساب التاجر"
                  : "سيتم إعلام التاجر برفض طلبه"}
              </DialogDescription>
            </DialogHeader>

            {selectedApp && (
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">
                    {selectedApp.storeConfig.storeName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedApp.merchantData.firstName}{" "}
                    {selectedApp.merchantData.lastName}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    ملاحظات {reviewAction === "approve" ? "الموافقة" : "الرفض"}{" "}
                    (اختياري)
                  </label>
                  <Textarea
                    placeholder="أضف ملاحظاتك هنا..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                {reviewAction === "reject" && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ يرجى تقديم سبب واضح للرفض لمساعدة التاجر في تحسين طلبه
                      المستقبلي
                    </p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setReviewDialogOpen(false)}
                disabled={processing === selectedApp?.id}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleReview}
                disabled={processing === selectedApp?.id}
                variant={reviewAction === "approve" ? "default" : "destructive"}
                className={
                  reviewAction === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
              >
                {processing === selectedApp?.id ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : reviewAction === "approve" ? (
                  <>
                    <CheckCircle className="h-4 w-4 ml-2" />
                    تأكيد الموافقة
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 ml-2" />
                    تأكيد الرفض
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
