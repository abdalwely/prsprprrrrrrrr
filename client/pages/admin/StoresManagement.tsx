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
import { storeService, Store } from "@/lib/src";
import {
  Store as StoreIcon,
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
  Upload,
  Users,
  BarChart3,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

type SafeStore = Store & {
  contact: {
    email: string;
    phone: string;
    address?: string;
    city?: string;
  };
  name: string;
  description: string;
  status: "active" | "pending" | "suspended";
  subdomain: string;
  createdAt: string;
  updatedAt: string;
  logo?: string | null;
  owner: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

export default function StoresManagement() {
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<SafeStore[]>([]);
  const [filteredStores, setFilteredStores] = useState<SafeStore[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "pending" | "suspended"
  >("all");

  const { userData } = useAuth();
  const { toast } = useToast();
  const isArabic = language === "ar";

  const text = {
    ar: {
      storesManagement: "إدارة المتاجر",
      storesDescription: "إدارة ومراقبة جميع المتاجر على المنصة",
      totalStores: "إجمالي المتاجر",
      activeStores: "المتاجر النشطة",
      pendingStores: "متاجر معلقة",
      suspendedStores: "متاجر موقوفة",
      searchStores: "البحث في المتاجر",
      filterByStatus: "تصفية بالحالة",
      allStores: "جميع المتاجر",
      active: "نشط",
      pending: "قيد الانتظار",
      suspended: "موقوف",
      storeName: "اسم المتجر",
      owner: "المالك",
      status: "الحالة",
      createdDate: "تاريخ الإنشاء",
      actions: "الإجراءات",
      approve: "موافقة",
      suspend: "تعليق",
      activate: "تفعيل",
      view: "عرض",
      edit: "تعديل",
      delete: "حذف",
      loading: "جاري التحميل...",
      noStores: "لا توجد متاجر",
      backToDashboard: "العودة للوحة التحكم",
      exportData: "تصدير البيانات",
      importData: "استيراد البيانات",
      addNewStore: "إضافة متجر جديد",
      storeDetails: "تفاصيل المتجر",
      revenue: "الإيرادات",
      orders: "الطلبات",
      products: "المنتجات",
      location: "الموقع",
      contact: "التواصل",
      confirmAction: "تأكيد الإجراء",
      success: "تم بنجاح",
      error: "حدث خطأ",
    },
    en: {
      storesManagement: "Stores Management",
      storesDescription: "Manage and monitor all stores on the platform",
      totalStores: "Total Stores",
      activeStores: "Active Stores",
      pendingStores: "Pending Stores",
      suspendedStores: "Suspended Stores",
      searchStores: "Search stores",
      filterByStatus: "Filter by status",
      allStores: "All Stores",
      active: "Active",
      pending: "Pending",
      suspended: "Suspended",
      storeName: "Store Name",
      owner: "Owner",
      status: "Status",
      createdDate: "Created Date",
      actions: "Actions",
      approve: "Approve",
      suspend: "Suspend",
      activate: "Activate",
      view: "View",
      edit: "Edit",
      delete: "Delete",
      loading: "Loading...",
      noStores: "No stores found",
      backToDashboard: "Back to Dashboard",
      exportData: "Export Data",
      importData: "Import Data",
      addNewStore: "Add New Store",
      storeDetails: "Store Details",
      revenue: "Revenue",
      orders: "Orders",
      products: "Products",
      location: "Location",
      contact: "Contact",
      confirmAction: "Confirm Action",
      success: "Success",
      error: "Error occurred",
    },
  };

  const currentText = text[language];

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    filterStores();
  }, [stores, searchTerm, statusFilter]);

  const isValidDate = (date: any): boolean => {
    if (!date) return false;
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
  };

  const safeDateToString = (date: any): string => {
    if (isValidDate(date)) {
      return new Date(date).toISOString();
    }
    return new Date().toISOString();
  };

  const loadStores = async () => {
    setLoading(true);
    try {
      const storesData = await storeService.getAll();

      const cleanedStores: SafeStore[] = storesData.map((store) => {
        const baseContact = {
          email: "",
          phone: "",
          address: "",
          city: "",
        };

        return {
          ...store,
          contact: {
            ...baseContact,
            ...store.contact,
            email: store.contact?.email || "",
            phone: store.contact?.phone || "",
          },
          name: store.name || "بدون اسم",
          description: store.description || "لا يوجد وصف",
          status: store.status || "pending",
          subdomain: store.subdomain || "unknown",
          createdAt: safeDateToString(store.createdAt),
          updatedAt: safeDateToString(store.updatedAt),
          logo: store.logo || null,
          owner: store.ownerId || {
            firstName: "غير",
            lastName: "معروف",
            email: store.contact?.email || "",
          },
        } as SafeStore;
      });

      setStores(cleanedStores);
    } catch (error) {
      console.error("Error loading stores:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل المتاجر",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterStores = () => {
    let filtered = stores;

    if (searchTerm) {
      filtered = filtered.filter(
        (store) =>
          store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.contact?.email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          store.subdomain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${store.owner?.firstName} ${store.owner?.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((store) => store.status === statusFilter);
    }

    setFilteredStores(filtered);
  };

  const handleStoreAction = async (
    storeId: string,
    action: "approve" | "suspend" | "activate" | "delete",
  ) => {
    try {
      let confirmMessage = "";
      let newStatus: Store["status"] | null = null;

      switch (action) {
        case "approve":
          confirmMessage = "هل تريد الموافقة على هذا المتجر؟";
          newStatus = "active";
          break;
        case "suspend":
          confirmMessage = "هل تريد تعليق هذا المتجر؟";
          newStatus = "suspended";
          break;
        case "activate":
          confirmMessage = "هل تريد تفعيل هذا المتجر؟";
          newStatus = "active";
          break;
        case "delete":
          confirmMessage =
            "هل تريد حذف هذا المتجر نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.";
          break;
      }

      if (!confirm(confirmMessage)) return;

      if (action === "delete") {
        await storeService.delete(storeId);
        toast({
          title: currentText.success,
          description: "تم حذف المتجر بنجاح",
        });
      } else if (newStatus) {
        await storeService.update(storeId, { status: newStatus });
        toast({
          title: currentText.success,
          description: `تم ${action === "approve" ? "الموافقة على" : action === "suspend" ? "تعليق" : "تفعيل"} المتجر بنجاح`,
        });
      }

      loadStores();
    } catch (error) {
      console.error(`Error ${action}ing store:`, error);
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

  const formatDate = (dateString: string) => {
    try {
      if (!isValidDate(dateString)) {
        return "تاريخ غير معروف";
      }
      return new Date(dateString).toLocaleDateString(
        isArabic ? "ar-YE" : "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        },
      );
    } catch (error) {
      return "تاريخ غير معروف";
    }
  };

  const stats = {
    total: stores.length,
    active: stores.filter((store) => store.status === "active").length,
    pending: stores.filter((store) => store.status === "pending").length,
    suspended: stores.filter((store) => store.status === "suspended").length,
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
                <StoreIcon className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">
                  {currentText.storesManagement}
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
                {currentText.addNewStore}
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
                    {currentText.totalStores}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <StoreIcon className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {currentText.activeStores}
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
                    {currentText.pendingStores}
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
                    {currentText.suspendedStores}
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

        {/* Stores Table */}
        <Card>
          <CardHeader>
            <CardTitle>{currentText.storesManagement}</CardTitle>
            <CardDescription>{currentText.storesDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={currentText.searchStores}
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
                  <option value="all">{currentText.allStores}</option>
                  <option value="active">{currentText.active}</option>
                  <option value="pending">{currentText.pending}</option>
                  <option value="suspended">{currentText.suspended}</option>
                </select>
              </div>
            </div>

            {/* Stores List */}
            {filteredStores.length === 0 ? (
              <div className="text-center py-12">
                <StoreIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {currentText.noStores}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "لا توجد متاجر مطابقة لمعايير البحث"
                    : "لم يتم إنشاء أي متاجر بعد"}
                </p>
                <Button className="btn-gradient">
                  <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {currentText.addNewStore}
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        {currentText.storeName}
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        {currentText.owner}
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        {currentText.contact}
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        {currentText.status}
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        {currentText.createdDate}
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        {currentText.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStores.map((store) => (
                      <tr
                        key={store.id}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-brand/20 rounded-lg flex items-center justify-center">
                              {store.logo ? (
                                <img
                                  src={store.logo}
                                  alt={store.name}
                                  className="w-10 h-10 rounded object-cover"
                                />
                              ) : (
                                <StoreIcon className="h-6 w-6 text-primary" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {store.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {store.subdomain}.platform.com
                              </div>
                              {store.contact?.city && (
                                <div className="text-xs text-gray-500 flex items-center mt-1">
                                  <MapPin className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
                                  {store.contact.city}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {store.owner?.firstName} {store.owner?.lastName}
                            </div>
                            <div className="text-gray-600">
                              {store.owner?.email}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm space-y-1">
                            <div className="flex items-center text-gray-600">
                              <Mail className="h-3 w-3 mr-2 rtl:ml-2 rtl:mr-0" />
                              {store.contact?.email || "لا يوجد"}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Phone className="h-3 w-3 mr-2 rtl:ml-2 rtl:mr-0" />
                              {store.contact?.phone || "لا يوجد"}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(store.status)}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {formatDate(store.createdAt)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2 rtl:space-x-reverse">
                            <Link
                              to={`/store/${store.subdomain}`}
                              target="_blank"
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                title={currentText.view}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>

                            <Button
                              size="sm"
                              variant="outline"
                              title={currentText.edit}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            {store.status === "pending" && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() =>
                                  handleStoreAction(store.id, "approve")
                                }
                                title={currentText.approve}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}

                            {store.status === "active" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-yellow-600 hover:text-yellow-700 border-yellow-600 hover:bg-yellow-50"
                                onClick={() =>
                                  handleStoreAction(store.id, "suspend")
                                }
                                title={currentText.suspend}
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                            )}

                            {store.status === "suspended" && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() =>
                                  handleStoreAction(store.id, "activate")
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
                                handleStoreAction(store.id, "delete")
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
