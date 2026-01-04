// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Progress } from "@/components/ui/progress";
// import { Separator } from "@/components/ui/separator";
// import { Switch } from "@/components/ui/switch";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Skeleton } from "@/components/ui/skeleton";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "@/contexts/AuthContext";

// import {
//   Store as StoreIcon,
//   Package,
//   ShoppingCart,
//   TrendingUp,
//   TrendingDown,
//   Users,
//   Settings,
//   Plus,
//   Eye,
//   Edit,
//   Trash2,
//   MoreVertical,
//   BarChart3,
//   DollarSign,
//   AlertCircle,
//   CheckCircle,
//   Clock,
//   Truck,
//   CreditCard,
//   FileText,
//   Mail,
//   Search,
//   Download,
//   Shield,
//   Palette,
//   ExternalLink,
//   Target,
//   PieChart,
//   Activity,
//   UserPlus,
//   Bell,
//   Loader2,
//   ShoppingBag,
//   Filter,
//   Grid,
//   List,
//   RefreshCw,
//   Printer,
//   HelpCircle,
//   LogOut,
//   User,
//   Home,
//   Package2,
//   CreditCard as CreditCardIcon,
//   Truck as TruckIcon,
//   Users as UsersIcon,
//   PieChart as PieChartIcon,
//   Settings as SettingsIcon,
//   Bell as BellIcon,
//   Upload,
//   Image as ImageIcon,
//   Layout,
//   CheckSquare,
//   Copy,
//   XCircle,
//   PauseCircle,
//   Save,
//   ShieldCheck,
//   Receipt,
//   MapPin,
//   Building,
//   FileDigit,
//   Smartphone,
//   Globe,
//   Calendar,
//   Check,
//   X,
//   Heart,
//   Star,
//   Award,
//   TestTube,
//   Briefcase,
//   Code,
//   Gift,
//   MessageSquare,
//   Archive,
//   Wallet,
//   Ticket,
//   Link,
//   Wifi,
//   Heart as HeartIcon,
//   MessageSquare as MessageSquareIcon,
//   Archive as ArchiveIcon,
//   Briefcase as BriefcaseIcon,
//   Code as CodeIcon,
//   Gift as GiftIcon,
//   Ticket as TicketIcon,
//   Link as LinkIcon,
//   Wifi as WifiIcon,
//   Star as StarIcon,
//   Award as AwardIcon,
//   TestTube as TestTubeIcon,
// } from "lucide-react";
// import { Store } from "@/lib/src/types/store.types";
// import { Customer, customerService } from "@/lib/src/services/customer";
// import { Product } from "@/lib/src/types/product.types";
// import { Order } from "@/lib/src/types/order.types";
// import { Category } from "@/lib/src/types/category.types";
// import { ShippingAddress, ShippingMethod, ShippingZone } from "@/lib/src/types/shared.types";
// import { storeService } from "@/lib/src/services/store/store.service";
// import { productService } from "@/lib/src/services/product/product.service";
// import { orderService } from "@/lib/src/services/order/order.service";
// import { categoryService } from "@/lib/src/services/category/category.service";

// // تعريف واجهة ExtendedCustomer
// interface ExtendedCustomer extends Customer {
//   totalOrders?: number;
//   totalSpent?: number;
//   storeId: string;
// }

// type ExtendedStore = Store;

// // قائمة المحافظات اليمنية
// const YEMENI_GOVERNORATES = [
//   "أمانة العاصمة (صنعاء)",
//   "صنعاء",
//   "عدن",
//   "تعز",
//   "الحديدة",
//   "إب",
//   "ذمار",
//   "مأرب",
//   "الجوف",
//   "المهرة",
//   "حضرموت",
//   "شبوة",
//   "عمران",
//   "البيضاء",
//   "الضالع",
//   "لحج",
//   "أبين",
//   "حجة",
//   "صعدة",
//   "ريمة",
//   "سقطرى",
// ];

// export default function MerchantComprehensiveDashboard() {
//   const { userData } = useAuth();
//   const navigate = useNavigate();
//   const { toast } = useToast();

//   // الحالات الرئيسية
//   const [store, setStore] = useState<ExtendedStore | null>(null);
//   const [products, setProducts] = useState<Product[]>([]);
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [customers, setCustomers] = useState<ExtendedCustomer[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("overview");
//   const [searchTerm, setSearchTerm] = useState("");

//   // حالة التبويبات الفرعية لكل قسم
//   const [subActiveTab, setSubActiveTab] = useState<{
//     [key: string]: string;
//   }>({
//     products: "management",
//     orders: "management",
//     customers: "customers",
//     design: "store-data",
//     settings: "settings-tools",
//     analytics: "store-performance",
//   });

//   // حالات التحميل والحفظ
//   const [savingStoreSettings, setSavingStoreSettings] = useState(false);
//   const [savingShippingSettings, setSavingShippingSettings] = useState(false);
//   const [savingPaymentSettings, setSavingPaymentSettings] = useState(false);
//   const [savingDesignSettings, setSavingDesignSettings] = useState(false);
//   const [savingCustomerAddress, setSavingCustomerAddress] = useState<
//     string | null
//   >(null);
//   const [savingOrderAddress, setSavingOrderAddress] = useState<string | null>(
//     null,
//   );

//   // حوارات التأكيد
//   const [confirmDialog, setConfirmDialog] = useState({
//     open: false,
//     title: "",
//     message: "",
//     onConfirm: () => {},
//     type: "" as
//       | "store"
//       | "shipping"
//       | "payment"
//       | "design"
//       | "customer"
//       | "order",
//   });

//   // حالات التحرير
//   const [editingCustomer, setEditingCustomer] = useState<{
//     id: string;
//     shippingAddress: ShippingAddress;
//   } | null>(null);

//   const [editingOrder, setEditingOrder] = useState<{
//     id: string;
//     shippingAddress: ShippingAddress;
//   } | null>(null);

//   // الإحصائيات
//   const [stats, setStats] = useState({
//     totalRevenue: 0,
//     totalOrders: 0,
//     totalProducts: 0,
//     pendingOrders: 0,
//     lowStockProducts: 0,
//     activeCustomers: 0,
//     monthlyRevenue: 0,
//     conversionRate: 3.4,
//     averageOrderValue: 0,
//     returnRate: 1.2,
//     topSellingProducts: [] as Product[],
//     salesByMonth: [] as { month: string; sales: number }[],
//     visitorsCount: 1256,
//     bounceRate: 34.5,
//     newCustomersThisMonth: 24,
//     averageProcessingTime: 2.5,
//     customerSatisfaction: 92,
//   });

//   // إعدادات المتجر - تم التحديث بناءً على firestore.ts
//   const [storeSettings, setStoreSettings] = useState({
//     name: "",
//     description: "",
//     logo: "",
//     contactEmail: "",
//     contactPhone: "",
//     address: "",
//     city: "",
//     governorate: "",
//     country: "اليمن",
//     originalCity: "",
//     zipCode: "",
//     // الحقول في المستوى الأعلى من firestore.ts
//     currency: "YER",
//     language: "ar",
//     timezone: "Asia/Aden",
//     taxNumber: "",
//     commercialRegistration: "",
//   });

//   // إعدادات الشحن - تم التحديث بناءً على firestore.ts
//   const [shippingSettings, setShippingSettings] = useState({
//     enabled: true,
//     freeShippingThreshold: 20000,
//     shippingCost: 1500,
//     defaultCost: 1500,
//     shippingZones: [] as ShippingZone[],
//     shippingMethods: [] as ShippingMethod[],
//   });

//   // إعدادات الدفع - تم التحديث بناءً على firestore.ts
//   const [paymentSettings, setPaymentSettings] = useState({
//     cashOnDelivery: true,
//     bankTransfer: true,
//     creditCard: false,
//     paypal: false,
//     stripe: false,
//     mada: false,
//     mobileWallet: false,
//     bankInfo: {
//       bankName: "",
//       accountNumber: "",
//       accountName: "",
//       iban: "",
//       swiftCode: "",
//     },
//   });

//   // إعدادات التصميم
//   const [designSettings, setDesignSettings] = useState({
//     theme: "light",
//     primaryColor: "#3b82f6",
//     secondaryColor: "#8b5cf6",
//     fontFamily: "Tajawal",
//     logo: "",
//     favicon: "",
//   });

//   // تحميل البيانات الأولية
//   useEffect(() => {
//     if (userData) {
//       loadMerchantData();
//     }
//   }, [userData]);

//   const loadMerchantData = async () => {
//     try {
//       console.log("🔍 [DASHBOARD] بدء تحميل بيانات لوحة التحكم...");

//       if (!userData?.uid) {
//         console.warn("⚠️ لا يوجد معرف مستخدم");
//         return;
//       }

//       const userStores = await storeService.getByOwner(userData.uid);
//       console.log(`🏪 عدد المتاجر للمستخدم: ${userStores.length}`);

//       if (userStores.length === 0) {
//         console.warn("⚠️ المستخدم ليس لديه متاجر");
//         setStore(null);
//         setLoading(false);
//         return;
//       }

//       const merchantStore = userStores[0] as ExtendedStore;

//       // ✅ التحقق من الحقول المهمة
//       console.log("✅ المتجر المحمل:", {
//         id: merchantStore.id,
//         name: merchantStore.name,
//         // ⭐ النشاطات الفرعية
//         subBusinessTypes: merchantStore.subBusinessTypes || [],
//         primaryBusinessType: merchantStore.primaryBusinessType,
//         // ✅ الحقول في المستوى الأعلى
//         currency: merchantStore.currency || merchantStore.settings?.currency,
//         timezone: merchantStore.timezone || merchantStore.settings?.timezone,
//         language: merchantStore.language || merchantStore.settings?.language,
//         // ✅ الحقول الجديدة لليمن
//         taxNumber: merchantStore.taxNumber,
//         commercialRegistration: merchantStore.commercialRegistration,
//         // ✅ المحافظة
//         governorate: merchantStore.contact?.governorate,
//         originalCity: merchantStore.contact?.originalCity,
//         zipCode: merchantStore.contact?.zipCode,
//       });

//       setStore(merchantStore);

//       // ✅ تحديث إعدادات المتجر
//       setStoreSettings({
//         name: merchantStore.name,
//         description: merchantStore.description || "",
//         logo: merchantStore.logo || "",
//         contactEmail: merchantStore.contact?.email || "",
//         contactPhone: merchantStore.contact?.phone || "",
//         address: merchantStore.contact?.address || "",
//         city: merchantStore.contact?.city || "",
//         governorate:
//           merchantStore.contact?.governorate || YEMENI_GOVERNORATES[0],
//         country: merchantStore.contact?.country || "اليمن",
//         originalCity: merchantStore.contact?.originalCity || "",
//         zipCode: merchantStore.contact?.zipCode || "",
//         // ✅ الحقول في المستوى الأعلى
//         currency:
//           merchantStore.currency || merchantStore.settings?.currency || "YER",
//         language:
//           merchantStore.language || merchantStore.settings?.language || "ar",
//         timezone:
//           merchantStore.timezone ||
//           merchantStore.settings?.timezone ||
//           "Asia/Aden",
//         // ✅ الحقول الجديدة لليمن
//         taxNumber: merchantStore.taxNumber || "",
//         commercialRegistration: merchantStore.commercialRegistration || "",
//       });

//       // تحميل البيانات الأخرى
//       const [storeProducts, storeOrders, storeCategories] = await Promise.all([
//         productService.getByStore(merchantStore.id),
//         orderService.getByStore(merchantStore.id),
//         categoryService.getByStore(merchantStore.id),
//       ]);

//       setProducts(storeProducts);
//       setOrders(storeOrders);
//       setCategories(storeCategories);

//       // تحميل العملاء
//       const storeCustomers = await customerService.getByStore(merchantStore.id);
//       const extendedCustomers: ExtendedCustomer[] = storeCustomers.map(
//         (customer) => ({
//           ...customer,
//           storeId: merchantStore.id,
//           totalOrders: (customer as any).totalOrders || 0,
//           totalSpent: (customer as any).totalSpent || 0,
//         }),
//       );

//       setCustomers(extendedCustomers);

//       // تحديث الإحصائيات
//       updateStats(storeProducts, storeOrders, extendedCustomers);

//       // ✅ تحديث إعدادات الشحن (من firestore.ts)
//       if (merchantStore.settings?.shipping) {
//         setShippingSettings({
//           enabled: merchantStore.settings.shipping.enabled,
//           freeShippingThreshold:
//             merchantStore.settings.shipping.freeShippingThreshold || 20000,
//           shippingCost: merchantStore.settings.shipping.shippingCost || 1500,
//           defaultCost: merchantStore.settings.shipping.defaultCost || 1500,
//           shippingZones: merchantStore.settings.shipping.zones || [],
//           shippingMethods: merchantStore.settings.shipping.methods || [],
//         });
//       }

//       // ✅ تحديث إعدادات الدفع (من firestore.ts)
//       if (merchantStore.settings?.payment) {
//         setPaymentSettings({
//           cashOnDelivery: merchantStore.settings.payment.cashOnDelivery,
//           bankTransfer: merchantStore.settings.payment.bankTransfer,
//           creditCard: merchantStore.settings.payment.creditCard || false,
//           paypal: merchantStore.settings.payment.paypal || false,
//           stripe: merchantStore.settings.payment.stripe || false,
//           mada: merchantStore.settings.payment.mada || false,
//           mobileWallet: merchantStore.settings.payment.mobileWallet || false,
//           bankInfo: {
//             bankName: merchantStore.settings!.payment.bankInfo?.bankName || "",
//             accountNumber:
//               merchantStore.settings!.payment.bankInfo?.accountNumber || "",
//             accountName:
//               merchantStore.settings!.payment.bankInfo?.accountName || "",
//             iban: merchantStore.settings!.payment.bankInfo?.iban || "",
//             swiftCode:
//               merchantStore.settings!.payment.bankInfo?.swiftCode || "",
//           },
//         });
//       }

//       // تحديث إعدادات التصميم
//       if (merchantStore.customization) {
//         const { branding, colors } = merchantStore.customization;
//         if (branding && colors) {
//           setDesignSettings((prev) => ({
//             ...prev,
//             primaryColor: colors.primary || prev.primaryColor,
//             secondaryColor: colors.secondary || prev.secondaryColor,
//             logo: branding.logo || prev.logo,
//           }));
//         }
//       }

//       console.log("✅ تم تحميل جميع البيانات بنجاح!");
//     } catch (error) {
//       console.error("❌ خطأ في تحميل بيانات التاجر:", error);
//       toast({
//         title: "خطأ في تحميل البيانات",
//         description: "تعذر تحميل البيانات من قاعدة البيانات",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateStats = (
//     products: Product[],
//     orders: Order[],
//     customers: ExtendedCustomer[],
//   ) => {
//     const revenue = orders
//       .filter((order) => order.orderStatus === "delivered")
//       .reduce((sum, order) => sum + order.total, 0);

//     const pendingOrdersCount = orders.filter((order) =>
//       ["pending", "processing"].includes(order.orderStatus),
//     ).length;

//     const lowStockCount = products.filter(
//       (product) =>
//         product.inventory?.quantity <= 5 && product.status === "active",
//     ).length;

//     const activeCustomersCount = customers.filter(
//       (customer) => customer.isActive,
//     ).length;

//     const avgOrderValue = orders.length > 0 ? revenue / orders.length : 0;

//     const topProducts = [...products]
//       .sort(
//         (a, b) => (b.inventory?.quantity || 0) - (a.inventory?.quantity || 0),
//       )
//       .slice(0, 5);

//     const salesByMonth = Array.from({ length: 6 }, (_, i) => {
//       const date = new Date();
//       date.setMonth(date.getMonth() - i);
//       return {
//         month: date.toLocaleDateString("ar-YE", { month: "long" }),
//         sales: Math.floor(Math.random() * 500000) + 100000,
//       };
//     }).reverse();

//     setStats((prev) => ({
//       ...prev,
//       totalRevenue: revenue,
//       totalOrders: orders.length,
//       totalProducts: products.length,
//       pendingOrders: pendingOrdersCount,
//       lowStockProducts: lowStockCount,
//       activeCustomers: activeCustomersCount,
//       monthlyRevenue: revenue * 0.3,
//       averageOrderValue: avgOrderValue,
//       topSellingProducts: topProducts,
//       salesByMonth,
//     }));
//   };

//   // ✅ دوال الحفظ المحدثة لتتوافق مع firestore.ts
//   const showConfirmDialog = (
//     title: string,
//     message: string,
//     onConfirm: () => void,
//     type: "store" | "shipping" | "payment" | "design" | "customer" | "order",
//   ) => {
//     setConfirmDialog({
//       open: true,
//       title,
//       message,
//       onConfirm,
//       type,
//     });
//   };

//   // ✅ دالة حفظ إعدادات المتجر باستخدام الدوال المحدثة
//   const handleSaveStoreSettings = async () => {
//     if (!store) return;

//     const saveAction = async () => {
//       setSavingStoreSettings(true);
//       try {
//         // ✅ استخدام الدوال المحدثة من firestore.ts
//         await Promise.all([
//           // تحديث بيانات الاتصال مع المحافظة
//           updateStoreContactWithGovernorate(store.id, {
//             email: storeSettings.contactEmail,
//             phone: storeSettings.contactPhone,
//             address: storeSettings.address,
//             city: storeSettings.city,
//             governorate: storeSettings.governorate,
//             country: storeSettings.country,
//             originalCity: storeSettings.originalCity,
//             zipCode: storeSettings.zipCode,
//           }),
//           // تحديث المعلومات التجارية
//           updateStoreBusinessInfo(store.id, {
//             taxNumber: storeSettings.taxNumber,
//             commercialRegistration: storeSettings.commercialRegistration,
//           }),
//           // تحديث الإعدادات العامة
//           storeService.update(store.id, {
//             name: storeSettings.name,
//             description: storeSettings.description,
//             logo: storeSettings.logo,
//             currency: storeSettings.currency,
//             language: storeSettings.language,
//             timezone: storeSettings.timezone,
//           }),
//         ]);

//         toast({
//           title: "✅ تم الحفظ بنجاح",
//           description: "تم تحديث جميع إعدادات المتجر",
//         });

//         loadMerchantData();
//       } catch (error) {
//         console.error("❌ خطأ في حفظ إعدادات المتجر:", error);
//         toast({
//           title: "❌ خطأ في الحفظ",
//           description: "تعذر حفظ الإعدادات",
//           variant: "destructive",
//         });
//       } finally {
//         setSavingStoreSettings(false);
//       }
//     };

//     showConfirmDialog(
//       "تأكيد الحفظ",
//       "هل أنت متأكد من حفظ التغييرات على إعدادات المتجر؟",
//       saveAction,
//       "store",
//     );
//   };

//   // ✅ دالة حفظ إعدادات الشحن باستخدام الدوال المحدثة
//   const handleSaveShippingSettings = async () => {
//     if (!store) return;

//     const saveAction = async () => {
//       setSavingShippingSettings(true);
//       try {
//         // ✅ استخدام الدالة المحدثة من firestore.ts
//         await updateStoreShippingConfig(store.id, {
//           zones: shippingSettings.shippingZones,
//           methods: shippingSettings.shippingMethods,
//         });

//         // تحديث الإعدادات الأساسية للشحن
//         await storeService.update(store.id, {
//           settings: {
//             ...store?.settings,
//             shipping: {
//               ...store?.settings?.shipping,
//               enabled: shippingSettings.enabled,
//               freeShippingThreshold: shippingSettings.freeShippingThreshold,
//               shippingCost: shippingSettings.shippingCost,
//               defaultCost: shippingSettings.defaultCost,
//             },
//           },
//         });

//         toast({
//           title: "✅ تم الحفظ بنجاح",
//           description: "تم تحديث إعدادات الشحن",
//         });

//         loadMerchantData();
//       } catch (error) {
//         console.error("❌ خطأ في حفظ إعدادات الشحن:", error);
//         toast({
//           title: "❌ خطأ في الحفظ",
//           description: "تعذر حفظ إعدادات الشحن",
//           variant: "destructive",
//         });
//       } finally {
//         setSavingShippingSettings(false);
//       }
//     };

//     showConfirmDialog(
//       "تأكيد الحفظ",
//       "هل أنت متأكد من حفظ التغييرات على إعدادات الشحن؟",
//       saveAction,
//       "shipping",
//     );
//   };

//   // ✅ دالة حفظ إعدادات الدفع باستخدام الدوال المحدثة
//   const handleSavePaymentSettings = async () => {
//     if (!store) return;

//     const saveAction = async () => {
//       setSavingPaymentSettings(true);
//       try {
//         // ✅ استخدام الدالة المحدثة من firestore.ts
//         await updateStoreYemeniPaymentSettings(store.id, {
//           mada: paymentSettings.mada,
//           mobileWallet: paymentSettings.mobileWallet,
//           bankInfo: paymentSettings.bankInfo,
//         });

//         // تحديث الإعدادات الأساسية للدفع
//         await storeService.update(store.id, {
//           settings: {
//             ...store?.settings,
//             payment: {
//               ...store?.settings?.payment,
//               cashOnDelivery: paymentSettings.cashOnDelivery,
//               bankTransfer: paymentSettings.bankTransfer,
//               creditCard: paymentSettings.creditCard,
//               paypal: paymentSettings.paypal,
//               stripe: paymentSettings.stripe,
//             },
//           },
//         });

//         toast({
//           title: "✅ تم الحفظ بنجاح",
//           description: "تم تحديث إعدادات الدفع",
//         });

//         loadMerchantData();
//       } catch (error) {
//         console.error("❌ خطأ في حفظ إعدادات الدفع:", error);
//         toast({
//           title: "❌ خطأ في الحفظ",
//           description: "تعذر حفظ إعدادات الدفع",
//           variant: "destructive",
//         });
//       } finally {
//         setSavingPaymentSettings(false);
//       }
//     };

//     showConfirmDialog(
//       "تأكيد الحفظ",
//       "هل أنت متأكد من حفظ التغييرات على إعدادات الدفع؟",
//       saveAction,
//       "payment",
//     );
//   };

//   // ✅ دالة حفظ إعدادات التصميم
//   const handleSaveDesignSettings = async () => {
//     if (!store) return;

//     const saveAction = async () => {
//       setSavingDesignSettings(true);
//       try {
//         await storeService.update(store.id, {
//           customization: {
//             ...store?.customization,
//             colors: {
//               ...store?.customization?.colors,
//               primary: designSettings.primaryColor,
//               secondary: designSettings.secondaryColor,
//             },
//             branding: {
//               ...store?.customization?.branding,
//               logo: designSettings.logo,
//             },
//           },
//         });

//         toast({
//           title: "✅ تم الحفظ بنجاح",
//           description: "تم تحديث إعدادات التصميم",
//         });

//         loadMerchantData();
//       } catch (error) {
//         console.error("❌ خطأ في حفظ إعدادات التصميم:", error);
//         toast({
//           title: "❌ خطأ في الحفظ",
//           description: "تعذر حفظ إعدادات التصميم",
//           variant: "destructive",
//         });
//       } finally {
//         setSavingDesignSettings(false);
//       }
//     };

//     showConfirmDialog(
//       "تأكيد الحفظ",
//       "هل أنت متأكد من حفظ التغييرات على إعدادات التصميم؟",
//       saveAction,
//       "design",
//     );
//   };

//   // ✅ دالة تحديث عنوان العميل باستخدام الدوال المحدثة
//   const handleUpdateCustomerAddress = async (
//     customerId: string,
//     shippingAddress: ShippingAddress,
//   ) => {
//     setSavingCustomerAddress(customerId);
//     try {
//       // ✅ استخدام الدالة المحدثة من firestore.ts
//       await updateCustomerShippingAddress(customerId, shippingAddress);

//       toast({
//         title: "✅ تم التحديث",
//         description: "تم تحديث عنوان الشحن للعميل",
//       });

//       // تحديث القائمة المحلية
//       setCustomers(
//         customers.map((customer) =>
//           customer.id === customerId
//             ? { ...customer, shippingAddress }
//             : customer,
//         ),
//       );

//       setEditingCustomer(null);
//     } catch (error) {
//       console.error("❌ خطأ في تحديث عنوان العميل:", error);
//       toast({
//         title: "❌ خطأ في التحديث",
//         description: "تعذر تحديث عنوان العميل",
//         variant: "destructive",
//       });
//     } finally {
//       setSavingCustomerAddress(null);
//     }
//   };

//   // ✅ دالة تحديث عنوان الطلب باستخدام الدوال المحدثة
//   const handleUpdateOrderAddress = async (
//     orderId: string,
//     shippingAddress: ShippingAddress,
//   ) => {
//     setSavingOrderAddress(orderId);
//     try {
//       // ✅ استخدام الدالة المحدثة من firestore.ts
//       await updateOrderShippingAddressWithGovernorate(orderId, shippingAddress);

//       toast({
//         title: "✅ تم التحديث",
//         description: "تم تحديث عنوان الشحن للطلب",
//       });

//       // تحديث القائمة المحلية
//       setOrders(
//         orders.map((order) =>
//           order.id === orderId ? { ...order, shippingAddress } : order,
//         ),
//       );

//       setEditingOrder(null);
//     } catch (error) {
//       console.error("❌ خطأ في تحديث عنوان الطلب:", error);
//       toast({
//         title: "❌ خطأ في التحديث",
//         description: "تعذر تحديث عنوان الطلب",
//         variant: "destructive",
//       });
//     } finally {
//       setSavingOrderAddress(null);
//     }
//   };

//   // ✅ مكون محرر عنوان الشحن
//   const ShippingAddressEditor = ({
//     address,
//     onSave,
//     onCancel,
//     saving = false,
//     title = "تعديل عنوان الشحن",
//   }: {
//     address: ShippingAddress;
//     onSave: (address: ShippingAddress) => void;
//     onCancel: () => void;
//     saving?: boolean;
//     title?: string;
//   }) => {
//     const [formData, setFormData] = useState<ShippingAddress>(address);

//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>{title}</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label>المحافظة</Label>
//               <Select
//                 value={formData.governorate}
//                 onValueChange={(value) =>
//                   setFormData({ ...formData, governorate: value })
//                 }
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="اختر المحافظة" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {YEMENI_GOVERNORATES.map((gov) => (
//                     <SelectItem key={gov} value={gov}>
//                       {gov}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-2">
//               <Label>المدينة</Label>
//               <Input
//                 value={formData.city}
//                 onChange={(e) =>
//                   setFormData({ ...formData, city: e.target.value })
//                 }
//                 placeholder="المدينة"
//               />
//             </div>
//             <div className="space-y-2">
//               <Label>الشارع</Label>
//               <Input
//                 value={formData.street}
//                 onChange={(e) =>
//                   setFormData({ ...formData, street: e.target.value })
//                 }
//                 placeholder="اسم الشارع"
//               />
//             </div>
//             <div className="space-y-2">
//               <Label>الرمز البريدي</Label>
//               <Input
//                 value={formData.zipCode}
//                 onChange={(e) =>
//                   setFormData({ ...formData, zipCode: e.target.value })
//                 }
//                 placeholder="الرمز البريدي"
//               />
//             </div>
//             <div className="space-y-2">
//               <Label>الدولة</Label>
//               <Input
//                 value={formData.country}
//                 onChange={(e) =>
//                   setFormData({ ...formData, country: e.target.value })
//                 }
//                 placeholder="الدولة"
//               />
//             </div>
//           </div>
//           <div className="flex gap-2 justify-end">
//             <Button variant="outline" onClick={onCancel}>
//               إلغاء
//             </Button>
//             <Button onClick={() => onSave(formData)} disabled={saving}>
//               {saving ? (
//                 <>
//                   <Loader2 className="h-4 w-4 ml-2 animate-spin" />
//                   جاري الحفظ...
//                 </>
//               ) : (
//                 "حفظ"
//               )}
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   };

//   // ✅ دوال إدارة الشحن
//   const handleAddShippingZone = () => {
//     const newZone: ShippingZone = {
//       id: Date.now().toString(),
//       name: `منطقة ${shippingSettings.shippingZones.length + 1}`,
//       governorates: [YEMENI_GOVERNORATES[0]],
//       cost: 2000,
//       estimatedDays: "2-5 أيام",
//       enabled: true,
//     };

//     setShippingSettings({
//       ...shippingSettings,
//       shippingZones: [...shippingSettings.shippingZones, newZone],
//     });
//   };

//   const handleAddShippingMethod = () => {
//     const newMethod: ShippingMethod = {
//       id: Date.now().toString(),
//       name: `طريقة ${shippingSettings.shippingMethods.length + 1}`,
//       cost: 1000,
//       days: "1-3 أيام",
//       enabled: true,
//     };

//     setShippingSettings({
//       ...shippingSettings,
//       shippingMethods: [...shippingSettings.shippingMethods, newMethod],
//     });
//   };

//   const handleUpdateShippingZone = (
//     id: string,
//     updates: Partial<ShippingZone>,
//   ) => {
//     setShippingSettings({
//       ...shippingSettings,
//       shippingZones: shippingSettings.shippingZones.map((zone) =>
//         zone.id === id ? { ...zone, ...updates } : zone,
//       ),
//     });
//   };

//   const handleDeleteShippingZone = (id: string) => {
//     setShippingSettings({
//       ...shippingSettings,
//       shippingZones: shippingSettings.shippingZones.filter(
//         (zone) => zone.id !== id,
//       ),
//     });
//   };

//   // مكونات المساعد
//   const StatsCard = ({
//     title,
//     value,
//     icon: Icon,
//     change,
//     trend = "up",
//     color = "blue",
//   }: {
//     title: string;
//     value: string | number;
//     icon: React.ElementType;
//     change?: string;
//     trend?: "up" | "down";
//     color?: string;
//   }) => {
//     const colorClasses = {
//       blue: "bg-blue-50 text-blue-600 border-blue-200",
//       green: "bg-green-50 text-green-600 border-green-200",
//       purple: "bg-purple-50 text-purple-600 border-purple-200",
//       orange: "bg-orange-50 text-orange-600 border-orange-200",
//     };

//     return (
//       <Card
//         className={`border ${colorClasses[color as keyof typeof colorClasses]}`}
//       >
//         <CardContent className="p-6">
//           <div className="flex items-center justify-between flex-row-reverse">
//             <div className="text-right">
//               <p className="text-sm font-medium mb-1">{title}</p>
//               <p className="text-2xl font-bold">{value}</p>
//               {change && (
//                 <div className="flex items-center gap-1 mt-1 justify-end">
//                   <span className="text-xs text-gray-500">من الشهر الماضي</span>
//                   <span
//                     className={`text-xs ${trend === "up" ? "text-green-600" : "text-red-600"}`}
//                   >
//                     {change}
//                   </span>
//                   {trend === "up" ? (
//                     <TrendingUp className="h-3 w-3" />
//                   ) : (
//                     <TrendingDown className="h-3 w-3" />
//                   )}
//                 </div>
//               )}
//             </div>
//             <div
//               className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses].split(" ")[0]}`}
//             >
//               <Icon className="h-6 w-6" />
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   };

//   const StatusBadge = ({ status }: { status: string }) => {
//     const configs: Record<
//       string,
//       {
//         label: string;
//         variant: "default" | "secondary" | "destructive" | "outline";
//         icon: React.ElementType;
//       }
//     > = {
//       pending: { label: "في الانتظار", variant: "secondary", icon: Clock },
//       processing: { label: "قيد المعالجة", variant: "default", icon: Activity },
//       shipped: { label: "تم الشحن", variant: "default", icon: Truck },
//       delivered: { label: "تم التوصيل", variant: "default", icon: CheckCircle },
//       cancelled: { label: "ملغي", variant: "destructive", icon: XCircle },
//       active: { label: "نشط", variant: "default", icon: CheckCircle },
//       inactive: { label: "غير نشط", variant: "secondary", icon: PauseCircle },
//       draft: { label: "مسودة", variant: "outline", icon: FileText },
//     };

//     const config = configs[status] || {
//       label: status,
//       variant: "outline",
//       icon: HelpCircle,
//     };
//     const Icon = config.icon;

//     return (
//       <Badge
//         variant={config.variant}
//         className="flex items-center gap-1 flex-row-reverse"
//       >
//         <Icon className="h-3 w-3" />
//         {config.label}
//       </Badge>
//     );
//   };

//   // ==================== 📊 نظرة عامة ====================
//   const OverviewTab = () => (
//     <div className="space-y-6">
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatsCard
//           title="إجمالي المبيعات"
//           value={`${stats.totalRevenue.toLocaleString()} ريال`}
//           icon={DollarSign}
//           change="+12.5%"
//           trend="up"
//           color="green"
//         />
//         <StatsCard
//           title="الطلبات"
//           value={stats.totalOrders}
//           icon={ShoppingCart}
//           change="+8.2%"
//           trend="up"
//           color="blue"
//         />
//         <StatsCard
//           title="المنتجات"
//           value={stats.totalProducts}
//           icon={Package}
//           change="+15%"
//           trend="up"
//           color="purple"
//         />
//         <StatsCard
//           title="العملاء النشطين"
//           value={stats.activeCustomers}
//           icon={Users}
//           change="+24"
//           trend="up"
//           color="orange"
//         />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>الأداء الشهري</CardTitle>
//             <CardDescription>تحليل المبيعات خلال 6 أشهر</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="h-80 flex items-center justify-center bg-muted rounded-lg">
//               <div className="text-center">
//                 <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//                 <p className="text-muted-foreground">رسم بياني للأداء</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>المنتجات الأعلى مبيعاً</CardTitle>
//             <CardDescription>أفضل 5 منتجات من حيث المبيعات</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {stats.topSellingProducts.slice(0, 5).map((product, index) => (
//                 <div
//                   key={product.id}
//                   className="flex items-center justify-between p-3 hover:bg-muted rounded-lg"
//                 >
//                   <div className="flex items-center gap-3 flex-row-reverse">
//                     <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
//                       <span className="font-bold">{index + 1}</span>
//                     </div>
//                     <div className="text-right">
//                       <p className="font-medium">{product.name}</p>
//                       <p className="text-sm text-muted-foreground">
//                         {product.category}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="text-left">
//                     <p className="font-bold">{product.price} ريال</p>
//                     <p className="text-sm text-muted-foreground">
//                       {product.inventory?.quantity} متبقي
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );

//   // ==================== 📦 قسم المنتجات ====================
//   const ProductsTab = () => {
//     const subTabs = [
//       { id: "management", label: "إدارة المنتجات", icon: Package },
//       { id: "settings", label: "إعدادات المنتجات", icon: Settings },
//       { id: "categories", label: "التصنيفات والخيارات", icon: Grid },
//       { id: "editor", label: "محرر المنتجات", icon: Edit },
//       { id: "inventory", label: "إدارة المخزون", icon: Package2 },
//       { id: "transfer", label: "نقل المخزون", icon: Truck },
//       { id: "more", label: "المزيد", icon: MoreVertical },
//     ];

//     return (
//       <div className="flex flex-col lg:flex-row gap-6">
//         {/* شريط التبويبات الفرعي */}
//         <div className="w-full lg:w-64">
//           <Card className="lg:sticky lg:top-6">
//             <CardContent className="p-4">
//               <div className="space-y-1">
//                 {subTabs.map((tab) => (
//                   <Button
//                     key={tab.id}
//                     variant={
//                       subActiveTab.products === tab.id ? "secondary" : "ghost"
//                     }
//                     className="w-full justify-start flex-row-reverse mb-1"
//                     onClick={() =>
//                       setSubActiveTab({ ...subActiveTab, products: tab.id })
//                     }
//                   >
//                     <tab.icon className="h-4 w-4 ml-3" />
//                     {tab.label}
//                   </Button>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* المحتوى الرئيسي */}
//         <div className="flex-1">
//           {subActiveTab.products === "management" && (
//             <div className="space-y-6">
//               <div className="flex justify-between items-center">
//                 <div className="text-right">
//                   <h2 className="text-2xl font-bold">إدارة المنتجات</h2>
//                   <p className="text-muted-foreground">
//                     إدارة {products.length} منتج في متجرك
//                   </p>
//                 </div>
//                 <div className="flex gap-3">
//                   <Button
//                     variant="outline"
//                     onClick={() => navigate("/merchant/categories")}
//                   >
//                     <Grid className="h-4 w-4 ml-2" />
//                     التصنيفات
//                   </Button>
//                   <Button onClick={() => navigate("/merchant/products/new")}>
//                     <Plus className="h-4 w-4 ml-2" />
//                     إضافة منتج
//                   </Button>
//                 </div>
//               </div>

//               <Card>
//                 <CardContent className="p-0">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead className="text-right">المنتج</TableHead>
//                         <TableHead className="text-right">التصنيف</TableHead>
//                         <TableHead className="text-right">السعر</TableHead>
//                         <TableHead className="text-right">المخزون</TableHead>
//                         <TableHead className="text-right">الحالة</TableHead>
//                         <TableHead className="text-right">الإجراءات</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {products.slice(0, 10).map((product) => (
//                         <TableRow key={product.id}>
//                           <TableCell>
//                             <div className="flex items-center gap-3 flex-row-reverse">
//                               <div className="h-10 w-10 bg-muted rounded"></div>
//                               <div className="text-right">
//                                 <p className="font-medium">{product.name}</p>
//                                 <p className="text-sm text-muted-foreground">
//                                   {product.description?.substring(0, 50)}...
//                                 </p>
//                               </div>
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <Badge variant="outline">{product.category}</Badge>
//                           </TableCell>
//                           <TableCell>
//                             <div className="font-medium">
//                               {product.price} ريال
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex items-center gap-2">
//                               <div className="w-20">
//                                 <Progress
//                                   value={
//                                     ((product.inventory?.quantity || 0) / 100) *
//                                     100
//                                   }
//                                   className="h-2"
//                                 />
//                               </div>
//                               <span>{product.inventory?.quantity}</span>
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <StatusBadge status={product.status} />
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex gap-2 justify-end">
//                               <Button variant="ghost" size="icon">
//                                 <Eye className="h-4 w-4" />
//                               </Button>
//                               <Button variant="ghost" size="icon">
//                                 <Edit className="h-4 w-4" />
//                               </Button>
//                             </div>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </CardContent>
//               </Card>
//             </div>
//           )}

//           {subActiveTab.products === "settings" && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>إعدادات المنتجات</CardTitle>
//                 <CardDescription>تخصيص إعدادات المنتجات</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div className="space-y-2">
//                     <Label>الحد الأدنى للمخزون</Label>
//                     <Input type="number" placeholder="5" />
//                   </div>
//                   <div className="space-y-2">
//                     <Label>تحديد المنتجات المميزة تلقائياً</Label>
//                     <Switch />
//                   </div>
//                   <Button>حفظ الإعدادات</Button>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {subActiveTab.products === "categories" && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>التصنيفات والخيارات</CardTitle>
//                 <CardDescription>إدارة تصنيفات المنتجات</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   {categories.map((category) => (
//                     <div
//                       key={category.id}
//                       className="flex items-center justify-between p-3 border rounded"
//                     >
//                       <div className="text-right">
//                         <p className="font-medium">{category.name}</p>
//                         <p className="text-sm text-muted-foreground">
//                           {category.description}
//                         </p>
//                       </div>
//                       <div className="flex gap-2">
//                         <Button variant="ghost" size="sm">
//                           <Edit className="h-4 w-4" />
//                         </Button>
//                         <Button variant="ghost" size="sm">
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   ))}
//                   <Button>
//                     <Plus className="h-4 w-4 ml-2" />
//                     إضافة تصنيف جديد
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // ==================== 🛒 قسم الطلبات المحدث ====================
//   const OrdersTab = () => {
//     const subTabs = [
//       { id: "management", label: "إدارة الطلبات", icon: ShoppingCart },
//       { id: "settings", label: "إعدادات الطلبات", icon: Settings },
//       { id: "status", label: "حالات الطلب", icon: Activity },
//       { id: "batch", label: "تحديث حالة مجموعة طلبات", icon: RefreshCw },
//       { id: "auto-assign", label: "الإسناد التلقائي", icon: Target },
//       { id: "invoices", label: "تخصيص الفواتير", icon: FileText },
//       { id: "more", label: "المزيد", icon: MoreVertical },
//     ];

//     return (
//       <div className="flex flex-col lg:flex-row gap-6">
//         <div className="w-full lg:w-64">
//           <Card className="lg:sticky lg:top-6">
//             <CardContent className="p-4">
//               <div className="space-y-1">
//                 {subTabs.map((tab) => (
//                   <Button
//                     key={tab.id}
//                     variant={
//                       subActiveTab.orders === tab.id ? "secondary" : "ghost"
//                     }
//                     className="w-full justify-start flex-row-reverse mb-1"
//                     onClick={() =>
//                       setSubActiveTab({ ...subActiveTab, orders: tab.id })
//                     }
//                   >
//                     <tab.icon className="h-4 w-4 ml-3" />
//                     {tab.label}
//                   </Button>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="flex-1">
//           {subActiveTab.orders === "management" && (
//             <div className="space-y-6">
//               <div className="flex justify-between items-center">
//                 <div className="text-right">
//                   <h2 className="text-2xl font-bold">إدارة الطلبات</h2>
//                   <p className="text-muted-foreground">
//                     {stats.pendingOrders} طلب بحاجة للمعالجة
//                   </p>
//                 </div>
//                 <div className="flex gap-3">
//                   <Select defaultValue="all">
//                     <SelectTrigger className="w-32">
//                       <SelectValue placeholder="الحالة" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">جميع الحالات</SelectItem>
//                       <SelectItem value="pending">في الانتظار</SelectItem>
//                       <SelectItem value="processing">قيد المعالجة</SelectItem>
//                       <SelectItem value="shipped">تم الشحن</SelectItem>
//                       <SelectItem value="delivered">تم التوصيل</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <Button variant="outline">
//                     <Printer className="h-4 w-4 ml-2" />
//                     طباعة الفواتير
//                   </Button>
//                 </div>
//               </div>

//               <Card>
//                 <CardContent className="p-0">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead className="text-right">رقم الطلب</TableHead>
//                         <TableHead className="text-right">العميل</TableHead>
//                         <TableHead className="text-right">المحافظة</TableHead>
//                         <TableHead className="text-right">التاريخ</TableHead>
//                         <TableHead className="text-right">المبلغ</TableHead>
//                         <TableHead className="text-right">الحالة</TableHead>
//                         <TableHead className="text-right">الإجراءات</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {orders.slice(0, 10).map((order) => (
//                         <TableRow key={order.id}>
//                           <TableCell className="font-medium">
//                             #{order.id.slice(-6)}
//                           </TableCell>
//                           <TableCell>
//                             {order.customerInfo?.firstName}{" "}
//                             {order.customerInfo?.lastName}
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex flex-col">
//                               <span>
//                                 {order.shippingAddress?.governorate ||
//                                   "غير محدد"}
//                               </span>
//                               {order.shippingAddress?.city && (
//                                 <span className="text-xs text-muted-foreground">
//                                   {order.shippingAddress.city}
//                                 </span>
//                               )}
//                               {editingOrder?.id === order.id ? (
//                                 <Button
//                                   size="sm"
//                                   variant="ghost"
//                                   className="mt-1"
//                                   onClick={() => {
//                                     const defaultAddress: ShippingAddress = {
//                                       street:
//                                         order.shippingAddress?.street || "",
//                                       city: order.shippingAddress?.city || "",
//                                       state: order.shippingAddress?.state || "",
//                                       governorate:
//                                         order.shippingAddress?.governorate ||
//                                         "",
//                                       zipCode:
//                                         order.shippingAddress?.zipCode || "",
//                                       country:
//                                         order.shippingAddress?.country ||
//                                         "اليمن",
//                                     };
//                                     setEditingOrder({
//                                       id: order.id,
//                                       shippingAddress: defaultAddress,
//                                     });
//                                   }}
//                                 >
//                                   <Edit className="h-3 w-3 ml-1" />
//                                   تعديل العنوان
//                                 </Button>
//                               ) : (
//                                 <Button
//                                   size="sm"
//                                   variant="ghost"
//                                   className="mt-1"
//                                   onClick={() => {
//                                     const defaultAddress: ShippingAddress = {
//                                       street:
//                                         order.shippingAddress?.street || "",
//                                       city: order.shippingAddress?.city || "",
//                                       state: order.shippingAddress?.state || "",
//                                       governorate:
//                                         order.shippingAddress?.governorate ||
//                                         "",
//                                       zipCode:
//                                         order.shippingAddress?.zipCode || "",
//                                       country:
//                                         order.shippingAddress?.country ||
//                                         "اليمن",
//                                     };
//                                     setEditingOrder({
//                                       id: order.id,
//                                       shippingAddress: defaultAddress,
//                                     });
//                                   }}
//                                 >
//                                   <Edit className="h-3 w-3 ml-1" />
//                                   تعديل
//                                 </Button>
//                               )}
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             {new Date(order.createdAt).toLocaleDateString(
//                               "ar-YE",
//                             )}
//                           </TableCell>
//                           <TableCell>{order.total} ريال</TableCell>
//                           <TableCell>
//                             <StatusBadge status={order.orderStatus} />
//                           </TableCell>
//                           <TableCell>
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() =>
//                                 navigate(`/merchant/orders/${order.id}`)
//                               }
//                             >
//                               التفاصيل
//                             </Button>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </CardContent>
//               </Card>

//               {/* محرر عنوان الطلب */}
//               {editingOrder && (
//                 <ShippingAddressEditor
//                   address={editingOrder.shippingAddress}
//                   onSave={(address) =>
//                     handleUpdateOrderAddress(editingOrder.id, address)
//                   }
//                   onCancel={() => setEditingOrder(null)}
//                   saving={savingOrderAddress === editingOrder.id}
//                   title={`تعديل عنوان الطلب #${editingOrder.id.slice(-6)}`}
//                 />
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // ==================== 👥 قسم العملاء المحدث ====================
//   const CustomersTab = () => {
//     const subTabs = [
//       { id: "customers", label: "العملاء", icon: Users },
//       { id: "management", label: "إدارة العملاء", icon: User },
//       { id: "settings", label: "إعدادات العملاء", icon: Settings },
//       { id: "groups", label: "إدارة المجموعات", icon: UsersIcon },
//       { id: "import", label: "استيراد العملاء", icon: Download },
//     ];

//     return (
//       <div className="flex flex-col lg:flex-row gap-6">
//         <div className="w-full lg:w-64">
//           <Card className="lg:sticky lg:top-6">
//             <CardContent className="p-4">
//               <div className="space-y-1">
//                 {subTabs.map((tab) => (
//                   <Button
//                     key={tab.id}
//                     variant={
//                       subActiveTab.customers === tab.id ? "secondary" : "ghost"
//                     }
//                     className="w-full justify-start flex-row-reverse mb-1"
//                     onClick={() =>
//                       setSubActiveTab({ ...subActiveTab, customers: tab.id })
//                     }
//                   >
//                     <tab.icon className="h-4 w-4 ml-3" />
//                     {tab.label}
//                   </Button>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="flex-1">
//           {subActiveTab.customers === "customers" && (
//             <div className="space-y-6">
//               <div className="flex justify-between items-center">
//                 <div className="text-right">
//                   <h2 className="text-2xl font-bold">العملاء</h2>
//                   <p className="text-muted-foreground">
//                     {customers.length} عميل مسجل
//                   </p>
//                 </div>
//                 <Button variant="outline">
//                   <UserPlus className="h-4 w-4 ml-2" />
//                   إضافة عميل
//                 </Button>
//               </div>

//               <Card>
//                 <CardContent className="p-0">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead className="text-right">العميل</TableHead>
//                         <TableHead className="text-right">المحافظة</TableHead>
//                         <TableHead className="text-right">
//                           البريد الإلكتروني
//                         </TableHead>
//                         <TableHead className="text-right">الهاتف</TableHead>
//                         <TableHead className="text-right">
//                           عدد الطلبات
//                         </TableHead>
//                         <TableHead className="text-right">الإجراءات</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {customers.slice(0, 10).map((customer) => (
//                         <TableRow key={customer.id}>
//                           <TableCell>
//                             <div className="flex items-center gap-3 flex-row-reverse">
//                               <Avatar>
//                                 <AvatarFallback>
//                                   {customer.firstName?.[0]}
//                                 </AvatarFallback>
//                               </Avatar>
//                               <div className="text-right">
//                                 <p className="font-medium">
//                                   {customer.firstName} {customer.lastName}
//                                 </p>
//                               </div>
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex flex-col">
//                               <span>
//                                 {customer.shippingAddress?.governorate ||
//                                   "غير محدد"}
//                               </span>
//                               {customer.shippingAddress?.city && (
//                                 <span className="text-xs text-muted-foreground">
//                                   {customer.shippingAddress.city}
//                                 </span>
//                               )}
//                               {editingCustomer?.id === customer.id ? (
//                                 <Button
//                                   size="sm"
//                                   variant="ghost"
//                                   className="mt-1"
//                                   onClick={() => {
//                                     const defaultAddress: ShippingAddress = {
//                                       street:
//                                         customer.shippingAddress?.street || "",
//                                       city:
//                                         customer.shippingAddress?.city || "",
//                                       state:
//                                         customer.shippingAddress?.state || "",
//                                       governorate:
//                                         customer.shippingAddress?.governorate ||
//                                         "",
//                                       zipCode:
//                                         customer.shippingAddress?.zipCode || "",
//                                       country:
//                                         customer.shippingAddress?.country ||
//                                         "اليمن",
//                                     };
//                                     setEditingCustomer({
//                                       id: customer.id,
//                                       shippingAddress: defaultAddress,
//                                     });
//                                   }}
//                                 >
//                                   <Edit className="h-3 w-3 ml-1" />
//                                   تعديل العنوان
//                                 </Button>
//                               ) : (
//                                 <Button
//                                   size="sm"
//                                   variant="ghost"
//                                   className="mt-1"
//                                   onClick={() => {
//                                     const defaultAddress: ShippingAddress = {
//                                       street:
//                                         customer.shippingAddress?.street || "",
//                                       city:
//                                         customer.shippingAddress?.city || "",
//                                       state:
//                                         customer.shippingAddress?.state || "",
//                                       governorate:
//                                         customer.shippingAddress?.governorate ||
//                                         "",
//                                       zipCode:
//                                         customer.shippingAddress?.zipCode || "",
//                                       country:
//                                         customer.shippingAddress?.country ||
//                                         "اليمن",
//                                     };
//                                     setEditingCustomer({
//                                       id: customer.id,
//                                       shippingAddress: defaultAddress,
//                                     });
//                                   }}
//                                 >
//                                   <Edit className="h-3 w-3 ml-1" />
//                                   تعديل
//                                 </Button>
//                               )}
//                             </div>
//                           </TableCell>
//                           <TableCell>{customer.email}</TableCell>
//                           <TableCell>{customer.phone || "غير محدد"}</TableCell>
//                           <TableCell>{customer.totalOrders || 0}</TableCell>
//                           <TableCell>
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() =>
//                                 navigate(`/merchant/customers/${customer.id}`)
//                               }
//                             >
//                               التفاصيل
//                             </Button>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </CardContent>
//               </Card>

//               {/* محرر عنوان العميل */}
//               {editingCustomer && (
//                 <ShippingAddressEditor
//                   address={editingCustomer.shippingAddress}
//                   onSave={(address) =>
//                     handleUpdateCustomerAddress(editingCustomer.id, address)
//                   }
//                   onCancel={() => setEditingCustomer(null)}
//                   saving={savingCustomerAddress === editingCustomer.id}
//                   title={`تعديل عنوان العميل ${customers.find((c) => c.id === editingCustomer.id)?.firstName}`}
//                 />
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // ==================== 🎨 قسم المتجر المحدث ====================
//   const DesignTab = () => {
//     const subTabs = [
//       { id: "store-data", label: "بيانات المتجر", icon: StoreIcon },
//       { id: "design", label: "تصميم المتجر", icon: Palette },
//       { id: "popular", label: "الأكثر زيارة!", icon: TrendingUp },
//       { id: "themes", label: "متجر الثيمات", icon: Layout },
//       { id: "domain", label: "دومين المتجر", icon: Globe },
//       { id: "pages", label: "الصفحات التعريفية", icon: FileText },
//       { id: "banner", label: "الشريط الترويجي", icon: AlertCircle },
//       { id: "links", label: "روابط مخصصة", icon: LinkIcon },
//       { id: "languages", label: "اللغات", icon: Globe },
//       { id: "currencies", label: "العملات", icon: DollarSign },
//       { id: "maintenance", label: "وضع الصيانة", icon: WifiIcon },
//     ];

//     return (
//       <div className="flex flex-col lg:flex-row gap-6">
//         <div className="w-full lg:w-64">
//           <Card className="lg:sticky lg:top-6">
//             <ScrollArea className="h-[600px]">
//               <CardContent className="p-4">
//                 <div className="space-y-1">
//                   {subTabs.map((tab) => (
//                     <Button
//                       key={tab.id}
//                       variant={
//                         subActiveTab.design === tab.id ? "secondary" : "ghost"
//                       }
//                       className="w-full justify-start flex-row-reverse mb-1"
//                       onClick={() =>
//                         setSubActiveTab({ ...subActiveTab, design: tab.id })
//                       }
//                     >
//                       <tab.icon className="h-4 w-4 ml-3" />
//                       {tab.label}
//                     </Button>
//                   ))}
//                 </div>
//               </CardContent>
//             </ScrollArea>
//           </Card>
//         </div>

//         <div className="flex-1">
//           {subActiveTab.design === "store-data" && (
//             <div className="space-y-6">
//               <div className="text-right">
//                 <h2 className="text-2xl font-bold">بيانات المتجر</h2>
//                 <p className="text-muted-foreground">
//                   إدارة الإعدادات العامة والمالية للمتجر
//                 </p>
//               </div>

//               <Card>
//                 <CardHeader>
//                   <CardTitle>المعلومات العامة</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="store-name">اسم المتجر</Label>
//                       <Input
//                         id="store-name"
//                         value={storeSettings.name}
//                         onChange={(e) =>
//                           setStoreSettings({
//                             ...storeSettings,
//                             name: e.target.value,
//                           })
//                         }
//                         placeholder="أدخل اسم المتجر"
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="store-email">البريد الإلكتروني</Label>
//                       <Input
//                         id="store-email"
//                         type="email"
//                         value={storeSettings.contactEmail}
//                         onChange={(e) =>
//                           setStoreSettings({
//                             ...storeSettings,
//                             contactEmail: e.target.value,
//                           })
//                         }
//                         placeholder="email@example.com"
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="store-phone">رقم الهاتف</Label>
//                       <Input
//                         id="store-phone"
//                         value={storeSettings.contactPhone}
//                         onChange={(e) =>
//                           setStoreSettings({
//                             ...storeSettings,
//                             contactPhone: e.target.value,
//                           })
//                         }
//                         placeholder="+967 7X XXX XXXX"
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="store-currency">العملة</Label>
//                       <Select
//                         value={storeSettings.currency}
//                         onValueChange={(value) =>
//                           setStoreSettings({
//                             ...storeSettings,
//                             currency: value,
//                           })
//                         }
//                       >
//                         <SelectTrigger>
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="YER">ريال يمني (ر.ي)</SelectItem>
//                           <SelectItem value="SAR">ريال سعودي (ر.س)</SelectItem>
//                           <SelectItem value="USD">دولار أمريكي ($)</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="store-governorate">المحافظة</Label>
//                       <Select
//                         value={storeSettings.governorate}
//                         onValueChange={(value) =>
//                           setStoreSettings({
//                             ...storeSettings,
//                             governorate: value,
//                           })
//                         }
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="اختر المحافظة" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {YEMENI_GOVERNORATES.map((gov) => (
//                             <SelectItem key={gov} value={gov}>
//                               {gov}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="store-city">المدينة/الحي</Label>
//                       <Input
//                         id="store-city"
//                         value={storeSettings.city}
//                         onChange={(e) =>
//                           setStoreSettings({
//                             ...storeSettings,
//                             city: e.target.value,
//                           })
//                         }
//                         placeholder="أدخل المدينة أو الحي"
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="store-original-city">
//                         المدينة الأصلية
//                       </Label>
//                       <Input
//                         id="store-original-city"
//                         value={storeSettings.originalCity}
//                         onChange={(e) =>
//                           setStoreSettings({
//                             ...storeSettings,
//                             originalCity: e.target.value,
//                           })
//                         }
//                         placeholder="المدينة الأصلية (اختياري)"
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="store-zip">الرمز البريدي</Label>
//                       <Input
//                         id="store-zip"
//                         value={storeSettings.zipCode}
//                         onChange={(e) =>
//                           setStoreSettings({
//                             ...storeSettings,
//                             zipCode: e.target.value,
//                           })
//                         }
//                         placeholder="الرمز البريدي"
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="tax-number">السجل الضريبي</Label>
//                       <Input
//                         id="tax-number"
//                         value={storeSettings.taxNumber}
//                         onChange={(e) =>
//                           setStoreSettings({
//                             ...storeSettings,
//                             taxNumber: e.target.value,
//                           })
//                         }
//                         placeholder="أدخل رقم السجل الضريبي"
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="commercial-registration">
//                         السجل التجاري
//                       </Label>
//                       <Input
//                         id="commercial-registration"
//                         value={storeSettings.commercialRegistration}
//                         onChange={(e) =>
//                           setStoreSettings({
//                             ...storeSettings,
//                             commercialRegistration: e.target.value,
//                           })
//                         }
//                         placeholder="أدخل رقم السجل التجاري"
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="store-description">وصف المتجر</Label>
//                     <Textarea
//                       id="store-description"
//                       className="min-h-[100px] text-right"
//                       value={storeSettings.description}
//                       onChange={(e) =>
//                         setStoreSettings({
//                           ...storeSettings,
//                           description: e.target.value,
//                         })
//                       }
//                       placeholder="أدخل وصفاً للمتجر..."
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="store-address">عنوان المتجر</Label>
//                     <Input
//                       id="store-address"
//                       value={storeSettings.address}
//                       onChange={(e) =>
//                         setStoreSettings({
//                           ...storeSettings,
//                           address: e.target.value,
//                         })
//                       }
//                       placeholder="أدخل العنوان الكامل"
//                     />
//                   </div>

//                   <div className="flex gap-4 justify-end">
//                     <Button
//                       onClick={handleSaveStoreSettings}
//                       disabled={savingStoreSettings}
//                     >
//                       {savingStoreSettings ? (
//                         <>
//                           <Loader2 className="h-4 w-4 ml-2 animate-spin" />
//                           جاري الحفظ...
//                         </>
//                       ) : (
//                         <>
//                           <Save className="h-4 w-4 ml-2" />
//                           حفظ الإعدادات
//                         </>
//                       )}
//                     </Button>
//                     <Button
//                       variant="outline"
//                       onClick={loadMerchantData}
//                       disabled={loading}
//                     >
//                       <RefreshCw className="h-4 w-4 ml-2" />
//                       تحديث البيانات
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           )}

//           {subActiveTab.design === "design" && (
//             <div className="space-y-6">
//               <div className="text-right">
//                 <h2 className="text-2xl font-bold">تصميم المتجر</h2>
//                 <p className="text-muted-foreground">
//                   تخصيص مظهر متجرك واختيار القالب المناسب
//                 </p>
//               </div>

//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>الألوان والخطوط</CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <div className="space-y-2">
//                       <Label>اللون الأساسي</Label>
//                       <div className="flex items-center gap-3">
//                         <div
//                           className="h-10 w-10 rounded border"
//                           style={{
//                             backgroundColor: designSettings.primaryColor,
//                           }}
//                         />
//                         <Input
//                           type="color"
//                           value={designSettings.primaryColor}
//                           onChange={(e) =>
//                             setDesignSettings({
//                               ...designSettings,
//                               primaryColor: e.target.value,
//                             })
//                           }
//                           className="w-32"
//                         />
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <Label>اللون الثانوي</Label>
//                       <div className="flex items-center gap-3">
//                         <div
//                           className="h-10 w-10 rounded border"
//                           style={{
//                             backgroundColor: designSettings.secondaryColor,
//                           }}
//                         />
//                         <Input
//                           type="color"
//                           value={designSettings.secondaryColor}
//                           onChange={(e) =>
//                             setDesignSettings({
//                               ...designSettings,
//                               secondaryColor: e.target.value,
//                             })
//                           }
//                           className="w-32"
//                         />
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <Label>نوع الخط</Label>
//                       <Select
//                         value={designSettings.fontFamily}
//                         onValueChange={(value) =>
//                           setDesignSettings({
//                             ...designSettings,
//                             fontFamily: value,
//                           })
//                         }
//                       >
//                         <SelectTrigger>
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="Tajawal">Tajawal</SelectItem>
//                           <SelectItem value="Cairo">Cairo</SelectItem>
//                           <SelectItem value="IBM Plex Sans Arabic">
//                             IBM Plex Sans Arabic
//                           </SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardHeader>
//                     <CardTitle>الشعار والصور</CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <div className="space-y-2">
//                       <Label>شعار المتجر</Label>
//                       <div className="h-32 w-32 bg-muted rounded-lg flex items-center justify-center mx-auto">
//                         {designSettings.logo ? (
//                           <img
//                             src={designSettings.logo}
//                             alt="Store Logo"
//                             className="h-full w-full object-cover rounded-lg"
//                           />
//                         ) : (
//                           <ImageIcon className="h-8 w-8 text-muted-foreground" />
//                         )}
//                       </div>
//                       <Button variant="outline" size="sm" className="w-full">
//                         <Upload className="h-4 w-4 ml-2" />
//                         رفع صورة
//                       </Button>
//                     </div>

//                     <div className="space-y-2">
//                       <Label>قالب التصميم</Label>
//                       <div className="grid grid-cols-3 gap-2">
//                         {["بسيط", "حديث", "كلاسيكي"].map((theme) => (
//                           <div
//                             key={theme}
//                             className="h-24 bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:border-2 hover:border-primary"
//                           >
//                             <p className="text-sm">{theme}</p>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>

//               <div className="flex justify-end">
//                 <Button
//                   onClick={handleSaveDesignSettings}
//                   disabled={savingDesignSettings}
//                 >
//                   {savingDesignSettings ? (
//                     <>
//                       <Loader2 className="h-4 w-4 ml-2 animate-spin" />
//                       جاري الحفظ...
//                     </>
//                   ) : (
//                     <>
//                       <Save className="h-4 w-4 ml-2" />
//                       حفظ إعدادات التصميم
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // ==================== ⚙️ قسم الإعدادات ====================
//   const SettingsTab = () => {
//     const settingsCategories = [
//       {
//         title: "الإعدادات والأدوات",
//         items: [
//           { id: "settings-tools", label: "مركز الدعم", icon: HelpCircle },
//           { id: "faq", label: "الأسئلة والتقييمات", icon: HelpCircle },
//           { id: "self-service", label: "نظام الخدمة الذاتية", icon: User },
//           { id: "tickets", label: "التذاكر", icon: Ticket },
//         ],
//       },
//       {
//         title: "سلة شات",
//         items: [{ id: "chat", label: "الشكاوى", icon: MessageSquareIcon }],
//       },
//       {
//         title: "الشحن",
//         items: [
//           { id: "shipping-companies", label: "شركات الشحن", icon: Truck },
//           { id: "shipping-settings", label: "إعدادات الشحن", icon: Settings },
//           { id: "packaging", label: "مواد التغليف", icon: Package },
//           { id: "archives", label: "أرشيف البوليصات", icon: ArchiveIcon },
//         ],
//       },
//       {
//         title: "الدفع",
//         items: [
//           { id: "payment-methods", label: "طرق الدفع", icon: CreditCard },
//           { id: "wallet", label: "المحفظة والفواتير", icon: Wallet },
//           { id: "payment-restrictions", label: "قيود الدفع", icon: Shield },
//           { id: "vat", label: "ضريبة القيمة المضافة", icon: Receipt },
//           {
//             id: "e-payment",
//             label: "عمليات الدفع الإلكتروني",
//             icon: CreditCard,
//           },
//         ],
//       },
//       {
//         title: "الأدوات المساعدة",
//         items: [
//           { id: "apps", label: "التطبيقات المثبتة", icon: Grid },
//           { id: "app-store", label: "متجر التطبيقات", icon: ShoppingBag },
//           {
//             id: "merchant-services",
//             label: "خدمات التاجر",
//             icon: BriefcaseIcon,
//           },
//           { id: "developer-tools", label: "أدوات المطور", icon: CodeIcon },
//         ],
//       },
//       {
//         title: "السجلات",
//         items: [
//           { id: "activity-log", label: "سجل العمليات", icon: Activity },
//           { id: "export-log", label: "سجل التصدير", icon: Download },
//           { id: "inventory-log", label: "سجل المخزون", icon: Package },
//           { id: "deleted-orders", label: "سجل الطلبات المحذوفة", icon: Trash2 },
//           {
//             id: "deleted-products",
//             label: "سجل المنتجات المحذوفة",
//             icon: Trash2,
//           },
//           { id: "gift-cards", label: "سجل البطاقات الرقمية", icon: GiftIcon },
//           {
//             id: "sms-log",
//             label: "سجل الرسائل النصية",
//             icon: MessageSquareIcon,
//           },
//         ],
//       },
//     ];

//     return (
//       <div className="flex flex-col lg:flex-row gap-6">
//         <div className="w-full lg:w-72">
//           <Card className="lg:sticky lg:top-6">
//             <ScrollArea className="h-[700px]">
//               <CardContent className="p-4">
//                 {settingsCategories.map((category, index) => (
//                   <div key={index} className="mb-6">
//                     <h3 className="font-medium mb-2 text-right text-sm text-muted-foreground">
//                       {category.title}
//                     </h3>
//                     <div className="space-y-1">
//                       {category.items.map((item) => (
//                         <Button
//                           key={item.id}
//                           variant={
//                             subActiveTab.settings === item.id
//                               ? "secondary"
//                               : "ghost"
//                           }
//                           className="w-full justify-start flex-row-reverse mb-1"
//                           onClick={() =>
//                             setSubActiveTab({
//                               ...subActiveTab,
//                               settings: item.id,
//                             })
//                           }
//                         >
//                           <item.icon className="h-4 w-4 ml-3" />
//                           {item.label}
//                         </Button>
//                       ))}
//                     </div>
//                     {index < settingsCategories.length - 1 && (
//                       <Separator className="my-4" />
//                     )}
//                   </div>
//                 ))}
//               </CardContent>
//             </ScrollArea>
//           </Card>
//         </div>

//         <div className="flex-1">
//           {subActiveTab.settings === "settings-tools" && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>مركز الدعم</CardTitle>
//                 <CardDescription>إدارة طلبات الدعم والتذاكر</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-center py-12">
//                   <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
//                   <p className="text-muted-foreground">مركز الدعم والتذاكر</p>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {subActiveTab.settings === "shipping-settings" && (
//             <div className="space-y-6">
//               <div className="text-right">
//                 <h2 className="text-2xl font-bold">إعدادات الشحن</h2>
//                 <p className="text-muted-foreground">
//                   إدارة سياسات الشحن والتكاليف حسب المحافظة
//                 </p>
//               </div>

//               <Card>
//                 <CardContent className="space-y-6">
//                   <div className="flex items-center justify-between">
//                     <div className="text-right">
//                       <p className="font-medium">تفعيل نظام الشحن</p>
//                       <p className="text-sm text-muted-foreground">
//                         تفعيل أو تعطيل خيارات الشحن
//                       </p>
//                     </div>
//                     <Switch
//                       checked={shippingSettings.enabled}
//                       onCheckedChange={(checked) =>
//                         setShippingSettings({
//                           ...shippingSettings,
//                           enabled: checked,
//                         })
//                       }
//                     />
//                   </div>

//                   {shippingSettings.enabled && (
//                     <>
//                       <div className="space-y-4">
//                         <div className="space-y-2">
//                           <Label>تكلفة الشحن الافتراضية</Label>
//                           <div className="flex items-center gap-2">
//                             <Input
//                               type="number"
//                               value={shippingSettings.shippingCost}
//                               onChange={(e) =>
//                                 setShippingSettings({
//                                   ...shippingSettings,
//                                   shippingCost: parseInt(e.target.value) || 0,
//                                 })
//                               }
//                               className="text-right"
//                             />
//                             <span className="text-sm">ريال يمني</span>
//                           </div>
//                         </div>

//                         <div className="space-y-2">
//                           <Label>حد الشحن المجاني</Label>
//                           <div className="flex items-center gap-2">
//                             <Input
//                               type="number"
//                               value={shippingSettings.freeShippingThreshold}
//                               onChange={(e) =>
//                                 setShippingSettings({
//                                   ...shippingSettings,
//                                   freeShippingThreshold:
//                                     parseInt(e.target.value) || 0,
//                                 })
//                               }
//                               className="text-right"
//                             />
//                             <span className="text-sm">ريال يمني</span>
//                           </div>
//                           <p className="text-sm text-muted-foreground">
//                             الشحن مجاني للطلبات فوق هذا المبلغ
//                           </p>
//                         </div>
//                       </div>

//                       <Separator />

//                       <div>
//                         <div className="flex justify-between items-center mb-4">
//                           <h3 className="font-medium">
//                             مناطق الشحن حسب المحافظة
//                           </h3>
//                           <Button size="sm" onClick={handleAddShippingZone}>
//                             <Plus className="h-4 w-4 ml-2" />
//                             إضافة منطقة
//                           </Button>
//                         </div>
//                         <div className="space-y-3">
//                           {shippingSettings.shippingZones.map((zone) => (
//                             <Card key={zone.id}>
//                               <CardContent className="p-4">
//                                 <div className="space-y-3">
//                                   <div className="flex justify-between items-center">
//                                     <div className="text-right">
//                                       <p className="font-medium">{zone.name}</p>
//                                       <p className="text-sm text-muted-foreground">
//                                         {zone.estimatedDays} • {zone.cost} ريال
//                                       </p>
//                                     </div>
//                                     <div className="flex items-center gap-2">
//                                       <Switch
//                                         checked={zone.enabled}
//                                         onCheckedChange={(checked) =>
//                                           handleUpdateShippingZone(zone.id, {
//                                             enabled: checked,
//                                           })
//                                         }
//                                       />
//                                       <Button
//                                         variant="ghost"
//                                         size="sm"
//                                         onClick={() =>
//                                           handleDeleteShippingZone(zone.id)
//                                         }
//                                       >
//                                         <Trash2 className="h-4 w-4 text-red-500" />
//                                       </Button>
//                                     </div>
//                                   </div>
//                                   <div className="space-y-2">
//                                     <Label>المحافظات المغطاة</Label>
//                                     <Select
//                                       value={zone.governorates[0]}
//                                       onValueChange={(value) =>
//                                         handleUpdateShippingZone(zone.id, {
//                                           governorates: [value],
//                                         })
//                                       }
//                                     >
//                                       <SelectTrigger>
//                                         <SelectValue placeholder="اختر المحافظات" />
//                                       </SelectTrigger>
//                                       <SelectContent>
//                                         {YEMENI_GOVERNORATES.map((gov) => (
//                                           <SelectItem key={gov} value={gov}>
//                                             {gov}
//                                           </SelectItem>
//                                         ))}
//                                       </SelectContent>
//                                     </Select>
//                                   </div>
//                                   <div className="space-y-2">
//                                     <Label>تكلفة الشحن</Label>
//                                     <Input
//                                       type="number"
//                                       value={zone.cost}
//                                       onChange={(e) =>
//                                         handleUpdateShippingZone(zone.id, {
//                                           cost: parseInt(e.target.value) || 0,
//                                         })
//                                       }
//                                       className="text-right"
//                                     />
//                                   </div>
//                                 </div>
//                               </CardContent>
//                             </Card>
//                           ))}
//                         </div>
//                       </div>

//                       <Separator />

//                       <div>
//                         <div className="flex justify-between items-center mb-4">
//                           <h3 className="font-medium">طرق الشحن المتاحة</h3>
//                           <Button size="sm" onClick={handleAddShippingMethod}>
//                             <Plus className="h-4 w-4 ml-2" />
//                             إضافة طريقة
//                           </Button>
//                         </div>
//                         <div className="space-y-3">
//                           {shippingSettings.shippingMethods.map((method) => (
//                             <div
//                               key={method.id}
//                               className="flex items-center justify-between p-3 border rounded-lg"
//                             >
//                               <div className="text-right">
//                                 <p className="font-medium">{method.name}</p>
//                                 <p className="text-sm text-muted-foreground">
//                                   {method.days} • {method.cost} ريال
//                                 </p>
//                               </div>
//                               <Switch
//                                 checked={method.enabled}
//                                 onCheckedChange={(checked) =>
//                                   setShippingSettings({
//                                     ...shippingSettings,
//                                     shippingMethods:
//                                       shippingSettings.shippingMethods.map(
//                                         (m) =>
//                                           m.id === method.id
//                                             ? { ...m, enabled: checked }
//                                             : m,
//                                       ),
//                                   })
//                                 }
//                               />
//                             </div>
//                           ))}
//                         </div>
//                       </div>

//                       <div className="flex justify-end">
//                         <Button
//                           onClick={handleSaveShippingSettings}
//                           disabled={savingShippingSettings}
//                         >
//                           {savingShippingSettings ? (
//                             <>
//                               <Loader2 className="h-4 w-4 ml-2 animate-spin" />
//                               جاري الحفظ...
//                             </>
//                           ) : (
//                             <>
//                               <Save className="h-4 w-4 ml-2" />
//                               حفظ إعدادات الشحن
//                             </>
//                           )}
//                         </Button>
//                       </div>
//                     </>
//                   )}
//                 </CardContent>
//               </Card>
//             </div>
//           )}

//           {subActiveTab.settings === "payment-methods" && (
//             <div className="space-y-6">
//               <div className="text-right">
//                 <h2 className="text-2xl font-bold">بوابات الدفع</h2>
//                 <p className="text-muted-foreground">
//                   إدارة طرق الدفع المتاحة في متجرك
//                 </p>
//               </div>

//               <Card>
//                 <CardContent className="space-y-6">
//                   <div className="space-y-4">
//                     <div className="flex items-center justify-between">
//                       <div className="text-right">
//                         <p className="font-medium">الدفع عند الاستلام</p>
//                         <p className="text-sm text-muted-foreground">
//                           الدفع نقداً عند استلام المنتج
//                         </p>
//                       </div>
//                       <Switch
//                         checked={paymentSettings.cashOnDelivery}
//                         onCheckedChange={(checked) =>
//                           setPaymentSettings({
//                             ...paymentSettings,
//                             cashOnDelivery: checked,
//                           })
//                         }
//                       />
//                     </div>

//                     <div className="flex items-center justify-between">
//                       <div className="text-right">
//                         <p className="font-medium">التحويل البنكي</p>
//                         <p className="text-sm text-muted-foreground">
//                           الدفع عن طريق التحويل المصرفي
//                         </p>
//                       </div>
//                       <Switch
//                         checked={paymentSettings.bankTransfer}
//                         onCheckedChange={(checked) =>
//                           setPaymentSettings({
//                             ...paymentSettings,
//                             bankTransfer: checked,
//                           })
//                         }
//                       />
//                     </div>

//                     <div className="flex items-center justify-between">
//                       <div className="text-right">
//                         <p className="font-medium">بطاقات الائتمان</p>
//                         <p className="text-sm text-muted-foreground">
//                           الدفع ببطاقات Visa/Mastercard
//                         </p>
//                       </div>
//                       <Switch
//                         checked={paymentSettings.creditCard}
//                         onCheckedChange={(checked) =>
//                           setPaymentSettings({
//                             ...paymentSettings,
//                             creditCard: checked,
//                           })
//                         }
//                       />
//                     </div>

//                     <div className="flex items-center justify-between">
//                       <div className="text-right">
//                         <p className="font-medium">مدى</p>
//                         <p className="text-sm text-muted-foreground">
//                           نظام الدفع الإلكتروني (مدى)
//                         </p>
//                       </div>
//                       <Switch
//                         checked={paymentSettings.mada}
//                         onCheckedChange={(checked) =>
//                           setPaymentSettings({
//                             ...paymentSettings,
//                             mada: checked,
//                           })
//                         }
//                       />
//                     </div>

//                     <div className="flex items-center justify-between">
//                       <div className="text-right">
//                         <p className="font-medium">محفظة إلكترونية</p>
//                         <p className="text-sm text-muted-foreground">
//                           الدفع عبر المحافظ الإلكترونية المحلية
//                         </p>
//                       </div>
//                       <Switch
//                         checked={paymentSettings.mobileWallet}
//                         onCheckedChange={(checked) =>
//                           setPaymentSettings({
//                             ...paymentSettings,
//                             mobileWallet: checked,
//                           })
//                         }
//                       />
//                     </div>
//                   </div>

//                   <Separator />

//                   {paymentSettings.bankTransfer && (
//                     <div>
//                       <h3 className="font-medium mb-4">
//                         معلومات الحساب البنكي
//                       </h3>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div className="space-y-2">
//                           <Label>اسم البنك</Label>
//                           <Input
//                             value={paymentSettings.bankInfo.bankName}
//                             onChange={(e) =>
//                               setPaymentSettings({
//                                 ...paymentSettings,
//                                 bankInfo: {
//                                   ...paymentSettings.bankInfo,
//                                   bankName: e.target.value,
//                                 },
//                               })
//                             }
//                             placeholder="اسم البنك"
//                           />
//                         </div>
//                         <div className="space-y-2">
//                           <Label>رقم الحساب</Label>
//                           <Input
//                             value={paymentSettings.bankInfo.accountNumber}
//                             onChange={(e) =>
//                               setPaymentSettings({
//                                 ...paymentSettings,
//                                 bankInfo: {
//                                   ...paymentSettings.bankInfo,
//                                   accountNumber: e.target.value,
//                                 },
//                               })
//                             }
//                             placeholder="رقم الحساب"
//                           />
//                         </div>
//                         <div className="space-y-2">
//                           <Label>اسم صاحب الحساب</Label>
//                           <Input
//                             value={paymentSettings.bankInfo.accountName}
//                             onChange={(e) =>
//                               setPaymentSettings({
//                                 ...paymentSettings,
//                                 bankInfo: {
//                                   ...paymentSettings.bankInfo,
//                                   accountName: e.target.value,
//                                 },
//                               })
//                             }
//                             placeholder="اسم صاحب الحساب"
//                           />
//                         </div>
//                         <div className="space-y-2">
//                           <Label>IBAN (اختياري)</Label>
//                           <Input
//                             value={paymentSettings.bankInfo.iban}
//                             onChange={(e) =>
//                               setPaymentSettings({
//                                 ...paymentSettings,
//                                 bankInfo: {
//                                   ...paymentSettings.bankInfo,
//                                   iban: e.target.value,
//                                 },
//                               })
//                             }
//                             placeholder="IBAN"
//                           />
//                         </div>
//                         <div className="space-y-2">
//                           <Label>SWIFT Code (اختياري)</Label>
//                           <Input
//                             value={paymentSettings.bankInfo.swiftCode}
//                             onChange={(e) =>
//                               setPaymentSettings({
//                                 ...paymentSettings,
//                                 bankInfo: {
//                                   ...paymentSettings.bankInfo,
//                                   swiftCode: e.target.value,
//                                 },
//                               })
//                             }
//                             placeholder="SWIFT Code"
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   <div className="flex justify-end">
//                     <Button
//                       onClick={handleSavePaymentSettings}
//                       disabled={savingPaymentSettings}
//                     >
//                       {savingPaymentSettings ? (
//                         <>
//                           <Loader2 className="h-4 w-4 ml-2 animate-spin" />
//                           جاري الحفظ...
//                         </>
//                       ) : (
//                         <>
//                           <Save className="h-4 w-4 ml-2" />
//                           حفظ إعدادات الدفع
//                         </>
//                       )}
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // ==================== 📈 قسم التقارير ====================
//   const AnalyticsTab = () => {
//     const reportCategories = [
//       {
//         title: "أداء المتجر",
//         items: [
//           { id: "store-performance", label: "المبيعات", icon: DollarSign },
//           { id: "customers-performance", label: "العملاء", icon: Users },
//           { id: "visits", label: "الزيارات", icon: Eye },
//           { id: "landing-pages", label: "صفحات الهبوط", icon: Layout },
//           {
//             id: "abandoned-carts",
//             label: "السلات المتروكة",
//             icon: ShoppingCart,
//           },
//           { id: "wishlist", label: "أمنيات العملاء", icon: HeartIcon },
//           { id: "conversion-rate", label: "معدل التحويل", icon: TrendingUp },
//           { id: "trial", label: "تجريبي", icon: TestTubeIcon },
//           { id: "payments-report", label: "المدفوعات", icon: CreditCard },
//           { id: "shipping-report", label: "الشحن", icon: Truck },
//           { id: "inventory-report", label: "المخزون", icon: Package },
//           {
//             id: "employees",
//             label: "الموظفين قريبًا!",
//             icon: Users,
//             disabled: true,
//           },
//           {
//             id: "operations",
//             label: "التشغيل قريبًا!",
//             icon: Settings,
//             disabled: true,
//           },
//         ],
//       },
//       {
//         title: "التحليلات الذكية",
//         items: [
//           { id: "ratings", label: "التقييم", icon: StarIcon },
//           { id: "products-analytics", label: "المنتجات", icon: Package },
//           {
//             id: "shipping-company-analytics",
//             label: "شركة الشحن",
//             icon: Truck,
//           },
//         ],
//       },
//       {
//         title: "التقارير",
//         items: [
//           { id: "sales-reports", label: "المبيعات", icon: DollarSign },
//           { id: "products-reports", label: "المنتجات", icon: Package },
//           { id: "customers-reports", label: "العملاء", icon: Users },
//           {
//             id: "shipping-companies-reports",
//             label: "شركات الشحن",
//             icon: Truck,
//           },
//           { id: "loyalty-system", label: "نظام الولاء", icon: AwardIcon },
//         ],
//       },
//     ];

//     return (
//       <div className="flex flex-col lg:flex-row gap-6">
//         <div className="w-full lg:w-72">
//           <Card className="lg:sticky lg:top-6">
//             <ScrollArea className="h-[700px]">
//               <CardContent className="p-4">
//                 {reportCategories.map((category, index) => (
//                   <div key={index} className="mb-6">
//                     <h3 className="font-medium mb-2 text-right text-sm text-muted-foreground">
//                       {category.title}
//                     </h3>
//                     <div className="space-y-1">
//                       {category.items.map((item) => (
//                         <Button
//                           key={item.id}
//                           variant={
//                             subActiveTab.analytics === item.id
//                               ? "secondary"
//                               : "ghost"
//                           }
//                           className="w-full justify-start flex-row-reverse mb-1"
//                           disabled={item.disabled}
//                           onClick={() =>
//                             !item.disabled &&
//                             setSubActiveTab({
//                               ...subActiveTab,
//                               analytics: item.id,
//                             })
//                           }
//                         >
//                           <item.icon className="h-4 w-4 ml-3" />
//                           {item.label}
//                         </Button>
//                       ))}
//                     </div>
//                     {index < reportCategories.length - 1 && (
//                       <Separator className="my-4" />
//                     )}
//                   </div>
//                 ))}
//               </CardContent>
//             </ScrollArea>
//           </Card>
//         </div>

//         <div className="flex-1">
//           {subActiveTab.analytics === "store-performance" && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>أداء المتجر - المبيعات</CardTitle>
//                 <CardDescription>تحليل المبيعات حسب الفترة</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div className="flex gap-4">
//                     <Button variant="outline" size="sm">
//                       اليوم
//                     </Button>
//                     <Button variant="outline" size="sm">
//                       الأسبوع
//                     </Button>
//                     <Button variant="outline" size="sm">
//                       الشهر
//                     </Button>
//                     <Button variant="outline" size="sm">
//                       السنة
//                     </Button>
//                   </div>
//                   <div className="h-64 bg-muted rounded flex items-center justify-center">
//                     <div className="text-center">
//                       <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//                       <p className="text-muted-foreground">
//                         رسم بياني للمبيعات
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {subActiveTab.analytics === "customers-performance" && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>تقارير العملاء</CardTitle>
//                 <CardDescription>معدلات الولاء والاحتفاظ</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <div className="text-sm">معدل الاحتفاظ</div>
//                     <div className="text-2xl font-bold">85%</div>
//                   </div>
//                   <Progress value={85} className="h-2" />

//                   <div className="flex items-center justify-between">
//                     <div className="text-sm">العملاء الجدد</div>
//                     <div className="text-2xl font-bold">24</div>
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <div className="text-sm">معدل تكرار الشراء</div>
//                     <div className="text-2xl font-bold">2.3</div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {subActiveTab.analytics === "products-reports" && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>تقارير المنتجات</CardTitle>
//                 <CardDescription>تحليل أداء المنتجات</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="overflow-x-auto">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead className="text-right">المنتج</TableHead>
//                         <TableHead className="text-right">المبيعات</TableHead>
//                         <TableHead className="text-right">الإيرادات</TableHead>
//                         <TableHead className="text-right">
//                           معدل التحويل
//                         </TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {stats.topSellingProducts.slice(0, 5).map((product) => (
//                         <TableRow key={product.id}>
//                           <TableCell>{product.name}</TableCell>
//                           <TableCell>
//                             {Math.floor(Math.random() * 100)}
//                           </TableCell>
//                           <TableCell>
//                             {Math.floor(Math.random() * 100000)} ريال
//                           </TableCell>
//                           <TableCell>
//                             {Math.floor(Math.random() * 20)}%
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </div>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // ✅ حوار التأكيد المحدث
//   const ConfirmDialog = () => (
//     <Dialog
//       open={confirmDialog.open}
//       onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
//     >
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>{confirmDialog.title}</DialogTitle>
//           <DialogDescription>{confirmDialog.message}</DialogDescription>
//         </DialogHeader>
//         <DialogFooter className="flex gap-2 justify-end">
//           <Button
//             variant="outline"
//             onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
//           >
//             <X className="h-4 w-4 ml-2" />
//             إلغاء
//           </Button>
//           <Button
//             onClick={() => {
//               confirmDialog.onConfirm();
//               setConfirmDialog({ ...confirmDialog, open: false });
//             }}
//           >
//             <Check className="h-4 w-4 ml-2" />
//             تأكيد
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );

//   // الهيدر
//   const DashboardHeader = () => (
//     <header className="sticky top-0 z-50 w-full border-b bg-background">
//       <div className="container mx-auto px-6 py-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
//               <StoreIcon className="h-4 w-4 text-white" />
//             </div>
//             <div>
//               <h1 className="font-bold text-lg">
//                 {store?.name || "لوحة التحكم"}
//               </h1>
//               <p className="text-xs text-muted-foreground">
//                 {store?.subdomain
//                   ? `${store.subdomain}.store.com`
//                   : "مرحباً بك في لوحة التحكم"}
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center gap-4">
//             <div className="relative">
//               <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="بحث..."
//                 className="pr-10 w-64"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>

//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" size="icon" className="relative">
//                   <Bell className="h-5 w-5" />
//                   <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
//                     3
//                   </span>
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end" className="w-80">
//                 <DropdownMenuLabel>الإشعارات</DropdownMenuLabel>
//                 <DropdownMenuSeparator />
//                 <ScrollArea className="h-64">
//                   <div className="p-4 text-center text-muted-foreground">
//                     لا توجد إشعارات جديدة
//                   </div>
//                 </ScrollArea>
//               </DropdownMenuContent>
//             </DropdownMenu>

//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" className="gap-2">
//                   <Avatar className="h-8 w-8">
//                     <AvatarFallback>
//                       {userData?.firstName?.[0] || "م"}
//                     </AvatarFallback>
//                   </Avatar>
//                   <span className="hidden md:inline">
//                     {userData?.firstName} {userData?.lastName}
//                   </span>
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuItem>
//                   <User className="h-4 w-4 ml-2" />
//                   الملف الشخصي
//                 </DropdownMenuItem>
//                 <DropdownMenuItem>
//                   <Settings className="h-4 w-4 ml-2" />
//                   الإعدادات
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem
//                   className="text-red-600"
//                   onClick={() => navigate("/login")}
//                 >
//                   <LogOut className="h-4 w-4 ml-2" />
//                   تسجيل الخروج
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </div>
//       </div>
//     </header>
//   );

//   // الشريط الجانبي
//   const Sidebar = () => {
//     const navItems = [
//       { id: "overview", label: "📊 نظرة عامة", icon: Home },
//       { id: "products", label: "📦 المنتجات", icon: Package },
//       { id: "orders", label: "🛒 الطلبات", icon: ShoppingCart },
//       { id: "customers", label: "👥 العملاء", icon: Users },
//       { id: "design", label: "🎨 المتجر", icon: StoreIcon },
//       { id: "settings", label: "⚙️ الإعدادات", icon: Settings },
//       { id: "analytics", label: "📈 التقارير", icon: BarChart3 },
//     ];

//     return (
//       <aside className="hidden md:block w-64 border-r bg-card">
//         <div className="sticky top-0 h-screen overflow-y-auto py-6">
//           <div className="px-4 mb-8">
//             <div className="flex items-center gap-3 mb-4 flex-row-reverse">
//               <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
//                 <StoreIcon className="h-6 w-6 text-white" />
//               </div>
//               <div className="text-right">
//                 <h2 className="font-bold text-lg">{store?.name}</h2>
//                 <p className="text-xs text-muted-foreground">
//                   {store?.contact?.governorate || "غير محدد"}
//                 </p>
//                 <p className="text-xs text-muted-foreground">
//                   {store?.status === "active" ? "🟢 نشط" : "🔴 غير نشط"}
//                 </p>
//               </div>
//             </div>
//             <Button className="w-full" size="sm">
//               <ExternalLink className="h-4 w-4 ml-2" />
//               زيارة المتجر
//             </Button>
//           </div>

//           <nav className="space-y-1 px-4">
//             {navItems.map((item) => (
//               <Button
//                 key={item.id}
//                 variant={activeTab === item.id ? "secondary" : "ghost"}
//                 className="w-full justify-start flex-row-reverse"
//                 onClick={() => {
//                   setActiveTab(item.id);
//                   if (item.id === "products")
//                     setSubActiveTab((prev) => ({
//                       ...prev,
//                       products: "management",
//                     }));
//                   if (item.id === "orders")
//                     setSubActiveTab((prev) => ({
//                       ...prev,
//                       orders: "management",
//                     }));
//                   if (item.id === "customers")
//                     setSubActiveTab((prev) => ({
//                       ...prev,
//                       customers: "customers",
//                     }));
//                   if (item.id === "design")
//                     setSubActiveTab((prev) => ({
//                       ...prev,
//                       design: "store-data",
//                     }));
//                   if (item.id === "settings")
//                     setSubActiveTab((prev) => ({
//                       ...prev,
//                       settings: "settings-tools",
//                     }));
//                   if (item.id === "analytics")
//                     setSubActiveTab((prev) => ({
//                       ...prev,
//                       analytics: "store-performance",
//                     }));
//                 }}
//               >
//                 <item.icon className="h-4 w-4 ml-3" />
//                 {item.label}
//               </Button>
//             ))}
//           </nav>

//           <Separator className="my-6" />

//           <div className="px-4">
//             <div className="space-y-3">
//               <h3 className="text-sm font-medium text-muted-foreground text-right">
//                 أدوات سريعة
//               </h3>
//               <Button
//                 variant="outline"
//                 className="w-full justify-start flex-row-reverse"
//                 size="sm"
//                 onClick={() => navigate("/merchant/products/new")}
//               >
//                 <Plus className="h-4 w-4 ml-2" />
//                 إضافة منتج سريع
//               </Button>
//               <Button
//                 variant="outline"
//                 className="w-full justify-start flex-row-reverse"
//                 size="sm"
//               >
//                 <Printer className="h-4 w-4 ml-2" />
//                 طباعة تقرير
//               </Button>
//               <Button
//                 variant="outline"
//                 className="w-full justify-start flex-row-reverse"
//                 size="sm"
//               >
//                 <HelpCircle className="h-4 w-4 ml-2" />
//                 المساعدة والدعم
//               </Button>
//             </div>
//           </div>
//         </div>
//       </aside>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex flex-col">
//         <div className="border-b py-4 px-6">
//           <div className="flex items-center justify-between">
//             <Skeleton className="h-8 w-48" />
//             <Skeleton className="h-10 w-64" />
//           </div>
//         </div>
//         <div className="flex-1 container mx-auto px-6 py-8">
//           <div className="animate-pulse space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//               {[1, 2, 3, 4].map((i) => (
//                 <Skeleton key={i} className="h-32 rounded-lg" />
//               ))}
//             </div>
//             <Skeleton className="h-64 rounded-lg" />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!store) {
//     return (
//       <div className="min-h-screen flex items-center justify-center p-4">
//         <Card className="w-full max-w-md">
//           <CardContent className="p-8 text-center">
//             <StoreIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
//             <h2 className="text-2xl font-bold mb-2">لا يوجد متجر</h2>
//             <p className="text-muted-foreground mb-6">
//               يبدو أنك لا تمتلك متجراً بعد. ابدأ رحلتك التجارية الآن!
//             </p>
//             <Button
//               onClick={() => navigate("/create-store")}
//               className="w-full"
//             >
//               <Plus className="h-4 w-4 ml-2" />
//               إنشاء متجر جديد
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <DashboardHeader />
//       <div className="flex flex-row-reverse">
//         <Sidebar />
//         <main className="flex-1 overflow-y-auto">
//           <div className="container mx-auto px-6 py-8">
//             <Tabs
//               value={activeTab}
//               onValueChange={setActiveTab}
//               className="space-y-6"
//             >
//               <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
//                 <TabsTrigger value="overview">📊 نظرة عامة</TabsTrigger>
//                 <TabsTrigger value="products">📦 المنتجات</TabsTrigger>
//                 <TabsTrigger value="orders">🛒 الطلبات</TabsTrigger>
//                 <TabsTrigger value="customers">👥 العملاء</TabsTrigger>
//                 <TabsTrigger value="design">🎨 المتجر</TabsTrigger>
//                 <TabsTrigger value="settings">⚙️ الإعدادات</TabsTrigger>
//                 <TabsTrigger value="analytics">📈 التقارير</TabsTrigger>
//               </TabsList>

//               <TabsContent value="overview">
//                 <OverviewTab />
//               </TabsContent>

//               <TabsContent value="products">
//                 <ProductsTab />
//               </TabsContent>

//               <TabsContent value="orders">
//                 <OrdersTab />
//               </TabsContent>

//               <TabsContent value="customers">
//                 <CustomersTab />
//               </TabsContent>

//               <TabsContent value="design">
//                 <DesignTab />
//               </TabsContent>

//               <TabsContent value="settings">
//                 <SettingsTab />
//               </TabsContent>

//               <TabsContent value="analytics">
//                 <AnalyticsTab />
//               </TabsContent>
//             </Tabs>
//           </div>
//         </main>
//       </div>
//       <ConfirmDialog />
//     </div>
//   );
// }
