import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/contexts/AuthContext";
import { userService, User } from "@/lib/userService"; // استيراد من الملف الجديد
import {
  Users,
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  Download,
  Mail,
  Phone,
  StoreIcon,
  MapPin,
  Calendar,
} from "lucide-react";

// نوع التاجر
type Merchant = User & {
  stores: string[];
};

export default function MerchantsManagement() {
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [loading, setLoading] = useState(true);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [filteredMerchants, setFilteredMerchants] = useState<Merchant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "pending" | "suspended"
  >("all");

  const { userData } = useAuth();
  const { toast } = useToast();
  const isArabic = language === "ar";

  const text = {
    ar: {
      merchantsManagement: "إدارة التجار",
      merchantsDescription: "إدارة ومراقبة جميع التجار على المنصة",
      totalMerchants: "إجمالي التجار",
      activeMerchants: "التجار النشطين",
      pendingMerchants: "تجار معلقين",
      suspendedMerchants: "تجار موقوفين",
      searchMerchants: "البحث في التجار",
      filterByStatus: "تصفية بالحالة",
      allMerchants: "جميع التجار",
      active: "نشط",
      pending: "قيد الانتظار",
      suspended: "موقوف",
      merchantName: "اسم التاجر",
      email: "البريد الإلكتروني",
      phone: "رقم الهاتف",
      stores: "المتاجر",
      status: "الحالة",
      createdDate: "تاريخ التسجيل",
      lastLogin: "آخر دخول",
      actions: "الإجراءات",
      approve: "موافقة",
      suspend: "تعليق",
      activate: "تفعيل",
      view: "عرض",
      edit: "تعديل",
      delete: "حذف",
      loading: "جاري التحميل...",
      noMerchants: "لا توجد تجار",
      backToDashboard: "العودة للوحة التحكم",
      exportData: "تصدير البيانات",
      importData: "استيراد البيانات",
      addNewMerchant: "إضافة تاجر جديد",
      sendMessage: "إرسال رسالة",
      viewStores: "عرض المتاجر",
      merchantDetails: "تفاصيل التاجر",
      location: "الموقع",
      contactInfo: "معلومات التواصل",
      confirmAction: "تأكيد الإجراء",
      success: "تم بنجاح",
      error: "حدث خطأ",
    },
    en: {
      merchantsManagement: "Merchants Management",
      merchantsDescription: "Manage and monitor all merchants on the platform",
      totalMerchants: "Total Merchants",
      activeMerchants: "Active Merchants",
      pendingMerchants: "Pending Merchants",
      suspendedMerchants: "Suspended Merchants",
      searchMerchants: "Search merchants",
      filterByStatus: "Filter by status",
      allMerchants: "All Merchants",
      active: "Active",
      pending: "Pending",
      suspended: "Suspended",
      merchantName: "Merchant Name",
      email: "Email",
      phone: "Phone",
      stores: "Stores",
      status: "Status",
      createdDate: "Registration Date",
      lastLogin: "Last Login",
      actions: "Actions",
      approve: "Approve",
      suspend: "Suspend",
      activate: "Activate",
      view: "View",
      edit: "Edit",
      delete: "Delete",
      loading: "Loading...",
      noMerchants: "No merchants found",
      backToDashboard: "Back to Dashboard",
      exportData: "Export Data",
      importData: "Import Data",
      addNewMerchant: "Add New Merchant",
      sendMessage: "Send Message",
      viewStores: "View Stores",
      merchantDetails: "Merchant Details",
      location: "Location",
      contactInfo: "Contact Information",
      confirmAction: "Confirm Action",
      success: "Success",
      error: "Error occurred",
    },
  };

  const currentText = text[language];

  useEffect(() => {
    loadMerchants();
  }, []);

  useEffect(() => {
    filterMerchants();
  }, [merchants, searchTerm, statusFilter]);

  const loadMerchants = async () => {
    setLoading(true);
    try {
      // جلب جميع التجار باستخدام الخدمة الجديدة
      const merchantUsers = await userService.getMerchants();

      const formattedMerchants: Merchant[] = merchantUsers.map((user) => {
        return {
          ...user,
          stores: user.stores || [],
        };
      });

      setMerchants(formattedMerchants);
    } catch (error) {
      console.error("Error loading merchants:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات التجار",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterMerchants = () => {
    let filtered = merchants;

    if (searchTerm) {
      filtered = filtered.filter(
        (merchant) =>
          `${merchant.firstName} ${merchant.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          merchant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (merchant.phone && merchant.phone.includes(searchTerm)) ||
          merchant.stores.some((store) =>
            store.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (merchant) => merchant.status === statusFilter,
      );
    }

    setFilteredMerchants(filtered);
  };

  const handleMerchantAction = async (
    merchantId: string,
    action: "approve" | "suspend" | "activate" | "delete",
  ) => {
    try {
      let confirmMessage = "";
      let newStatus: User["status"] | null = null;
      let newRole: User["role"] | null = null;

      switch (action) {
        case "approve":
          confirmMessage = "هل تريد الموافقة على هذا التاجر؟";
          newStatus = "active";
          newRole = "merchant";
          break;
        case "suspend":
          confirmMessage = "هل تريد تعليق هذا التاجر؟";
          newStatus = "suspended";
          break;
        case "activate":
          confirmMessage = "هل تريد تفعيل هذا التاجر؟";
          newStatus = "active";
          break;
        case "delete":
          confirmMessage =
            "هل تريد حذف هذا التاجر نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.";
          break;
      }

      if (!confirm(confirmMessage)) return;

      if (action === "delete") {
        await userService.deleteUser(merchantId);
        toast({
          title: currentText.success,
          description: "تم حذف التاجر بنجاح",
        });
      } else if (newStatus) {
        if (newRole) {
          await userService.updateMerchantStatus(
            merchantId,
            newStatus,
            newRole,
          );
        } else {
          await userService.updateMerchantStatus(merchantId, newStatus);
        }
        toast({
          title: currentText.success,
          description: `تم ${action === "approve" ? "الموافقة على" : action === "suspend" ? "تعليق" : "تفعيل"} التاجر بنجاح`,
        });
      }

      loadMerchants();
    } catch (error) {
      console.error(`Error ${action}ing merchant:`, error);
      toast({
        title: currentText.error,
        description: "فشل في تنفيذ الإجراء",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
            {currentText.active}
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
            {currentText.pending}
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
            {currentText.suspended}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    try {
      return date.toLocaleDateString(isArabic ? "ar-YE" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "تاريخ غير معروف";
    }
  };

  const formatDateTime = (date?: Date) => {
    if (!date) return "لم يسجل دخول";
    try {
      return date.toLocaleString(isArabic ? "ar-YE" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "تاريخ غير معروف";
    }
  };

  const stats = {
    total: merchants.length,
    active: merchants.filter((merchant) => merchant.status === "active").length,
    pending: merchants.filter((merchant) => merchant.status === "pending")
      .length,
    suspended: merchants.filter((merchant) => merchant.status === "suspended")
      .length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{currentText.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${isArabic ? "rtl" : "ltr"}`}
    >
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Link
                to="/admin/dashboard"
                className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>{currentText.backToDashboard}</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Users className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">
                  {currentText.merchantsManagement}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {currentText.exportData}
              </Button>
              <Button className="btn-gradient">
                <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {currentText.addNewMerchant}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {currentText.totalMerchants}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {currentText.activeMerchants}
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.active}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {currentText.pendingMerchants}
                  </p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {stats.pending}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {currentText.suspendedMerchants}
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {stats.suspended}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Merchants Table */}
        <Card>
          <CardHeader>
            <CardTitle>{currentText.merchantsManagement}</CardTitle>
            <CardDescription>
              {currentText.merchantsDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={currentText.searchMerchants}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="w-full sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">{currentText.allMerchants}</option>
                  <option value="active">{currentText.active}</option>
                  <option value="pending">{currentText.pending}</option>
                  <option value="suspended">{currentText.suspended}</option>
                </select>
              </div>
            </div>

            {/* Merchants List */}
            {filteredMerchants.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {currentText.noMerchants}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "لا توجد تجار مطابقين لمعايير البحث"
                    : "لم يتم تسجيل أي تجار بعد"}
                </p>
                <Button className="btn-gradient">
                  <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {currentText.addNewMerchant}
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        {currentText.merchantName}
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        {currentText.contactInfo}
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        {currentText.location}
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        {currentText.stores}
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        {currentText.status}
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        {currentText.lastLogin}
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        {currentText.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMerchants.map((merchant) => (
                      <tr
                        key={merchant.id}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-brand/20 rounded-full flex items-center justify-center">
                              {merchant.avatar ? (
                                <img
                                  src={merchant.avatar}
                                  alt={`${merchant.firstName} ${merchant.lastName}`}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <Users className="h-6 w-6 text-primary" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {merchant.firstName} {merchant.lastName}
                              </div>
                              <div className="text-sm text-gray-600 flex items-center">
                                <Calendar className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
                                {formatDate(merchant.createdAt)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm space-y-1">
                            <div className="flex items-center text-gray-600">
                              <Mail className="h-3 w-3 mr-2 rtl:ml-2 rtl:mr-0" />
                              {merchant.email}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Phone className="h-3 w-3 mr-2 rtl:ml-2 rtl:mr-0" />
                              {merchant.phone || "لا يوجد"}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600 flex items-center">
                            <MapPin className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
                            {merchant.city || "صنعاء"},{" "}
                            {merchant.country || "اليمن"}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {merchant.stores.length > 0 ? (
                              merchant.stores
                                .slice(0, 2)
                                .map((store, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    <StoreIcon className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
                                    {store}
                                  </Badge>
                                ))
                            ) : (
                              <span className="text-xs text-gray-500">
                                لا توجد متاجر
                              </span>
                            )}
                            {merchant.stores.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{merchant.stores.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(merchant.status)}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {formatDateTime(merchant.lastLogin)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2 rtl:space-x-reverse">
                            <Button
                              size="sm"
                              variant="outline"
                              title={currentText.view}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              title={currentText.edit}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            {merchant.status === "pending" && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() =>
                                  handleMerchantAction(merchant.id, "approve")
                                }
                                title={currentText.approve}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}

                            {merchant.status === "active" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-yellow-600 hover:text-yellow-700 border-yellow-600 hover:bg-yellow-50"
                                onClick={() =>
                                  handleMerchantAction(merchant.id, "suspend")
                                }
                                title={currentText.suspend}
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                            )}

                            {merchant.status === "suspended" && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() =>
                                  handleMerchantAction(merchant.id, "activate")
                                }
                                title={currentText.activate}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-600"
                              onClick={() =>
                                handleMerchantAction(merchant.id, "delete")
                              }
                              title={currentText.delete}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
