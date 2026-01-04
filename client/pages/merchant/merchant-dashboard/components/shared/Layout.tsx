import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Store as StoreIcon,
  Home,
  Package,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  Search,
  Bell,
  User,
  LogOut,
  ExternalLink,
  Plus,
  HelpCircle,
  Menu,
  X,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExtendedStore } from "@/lib/src";

interface DashboardHeaderProps {
  store: ExtendedStore | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  navigate: (path: string) => void;
  userData: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeSubTab?: string;
  setActiveSubTab?: (tab: string) => void;
  updateSubTab: (tabName: string, subTabId: string) => void;
}

const subTabsConfig: Record<
  string,
  Array<{
    id: string;
    label: string;
  }>
> = {
  overview: [{ id: "overview", label: "نظرة عامة" }],
  products: [
    { id: "management", label: "إدارة المنتجات" },
    { id: "settings", label: "إعدادات المنتجات" },
    { id: "categories", label: "التصنيفات والخيارات" },
    { id: "inventory", label: "إدارة المخزون" },
  ],
  orders: [
    { id: "management", label: "إدارة الطلبات" },
    { id: "settings", label: "إعدادات الطلب" },
    { id: "payments", label: "حالات الطلب" },
    { id: "invoices", label: "تخصيص الفواتير" },
  ],
  customers: [
    { id: "customers", label: "العملاء" },
    { id: "management", label: "إدارة العملاء" },
    { id: "settings", label: "إعدادات العملاء" },
    { id: "groups", label: "إدارة المجموعات" },
  ],
  design: [
    { id: "store-data", label: "بيانات المتجر" },
    { id: "business-activities", label: "الأنشطة التجارية" },
    { id: "compliance", label: "إعدادات الامتثال" },
    { id: "contact-info", label: "معلومات الاتصال" },
    { id: "design", label: "تصميم المتجر" },
    { id: "themes", label: "متجر الثيمات" },
    { id: "shipping", label: "إعدادات الشحن" },
    { id: "payment", label: "إعدادات الدفع" },
    { id: "taxes", label: "إعدادات الضرائب" },
  ],

  analytics: [
    { id: "store-performance", label: "أداء المتجر" },
    { id: "sales", label: "المبيعات" },
    { id: "customers-analytics", label: "العملاء" },
    { id: "reports", label: "التقارير" },
  ],
  settings: [
    { id: "settings-tools", label: "الإعدادات والأدوات" },
    { id: "support", label: "مركز الدعم" },
    { id: "shipping", label: "الشحن" },
    { id: "payment-methods", label: "طرق الدفع" },
  ],
};

export function DashboardHeader({
  store,
  searchTerm,
  setSearchTerm,
  navigate,
  userData,
  activeTab,
  setActiveTab,
  activeSubTab: externalActiveSubTab,
  setActiveSubTab: externalSetActiveSubTab,
  updateSubTab,
}: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [tempSearchTerm, setTempSearchTerm] = useState(searchTerm);
  const [internalActiveSubTab, setInternalActiveSubTab] = useState("");

  const activeSubTab =
    externalActiveSubTab !== undefined
      ? externalActiveSubTab
      : internalActiveSubTab;
  const setActiveSubTab = externalSetActiveSubTab || setInternalActiveSubTab;

  const navItems = [
    { id: "overview", label: "الرئيسية" },
    { id: "products", label: "المنتجات" },
    { id: "orders", label: "الطلبات" },
    { id: "customers", label: "العملاء" },
    { id: "design", label: "المتجر" },
    { id: "analytics", label: "التقارير" },
    { id: "settings", label: "الإعدادات" },
  ];

  const currentSubTabs = subTabsConfig[activeTab] || [];

  // تحديد التبويبات المرئية والمخفية بناءً على عدد التبويبات
  const shouldShowMore = currentSubTabs.length > 5;
  const visibleSubTabs = shouldShowMore
    ? currentSubTabs.slice(0, 5)
    : currentSubTabs;
  const hiddenSubTabs = shouldShowMore ? currentSubTabs.slice(5) : [];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);

    const defaultSubTabs: Record<string, string> = {
      products: "management",
      orders: "management",
      customers: "customers",
      design: "store-data",
      settings: "settings-tools",
      analytics: "store-performance",
    };

    if (defaultSubTabs[tabId]) {
      const subTabId = defaultSubTabs[tabId];
      setActiveSubTab(subTabId);
      if (updateSubTab) {
        updateSubTab(tabId, subTabId);
      }
    } else {
      setActiveSubTab("");
    }
  };

  const handleSubTabClick = (tabId: string) => {
    setActiveSubTab(tabId);
    if (updateSubTab) {
      updateSubTab(activeTab, tabId);
    }
  };

  const handleSearchSubmit = () => {
    setSearchTerm(tempSearchTerm);
    setSearchOpen(false);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
    if (e.key === "Escape") {
      setSearchOpen(false);
    }
  };

  const getAddButtonAction = () => {
    switch (activeTab) {
      case "products":
        return () => navigate("/merchant/products/new");
      case "customers":
        return () => navigate("/merchant/customers/new");
      case "orders":
        return () => navigate("/merchant/orders/new");
      default:
        return () => {};
    }
  };

  const [notifications, setNotifications] = useState([
    { id: 1, title: "طلب جديد", description: "لديك طلب جديد من محمد" },
    {
      id: 2,
      title: "منتج منخفض المخزون",
      description: 'المنتج "شاي أخضر" على وشك النفاد',
    },
  ]);

  return (
    <>
      {/* Main Header - Larger Height */}
      <header
        dir="rtl"
        className="fixed top-0 inset-x-0 z-50 h-16 bg-gradient-to-r from-primary to-brand text-white border-0"
      >
        <div className="flex h-full items-center justify-between px-4 lg:px-6">
          {/* Right Side - Store Logo + Navigation */}
          <div className="flex items-center gap-6">
            {/* Store Info */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-full bg-white/10">
                <StoreIcon className="h-4.5 w-4.5" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold leading-none">
                  {store?.name || "لوحة التحكم"}
                </p>
                <span className="text-xs text-white/60">
                  {store?.subdomain
                    ? `${store.subdomain}.store.com`
                    : "مرحباً بك"}
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center gap-6 text-sm">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={cn(
                    "transition-colors py-2",
                    activeTab === item.id
                      ? "font-semibold border-b-2 border-white"
                      : "text-white/70 hover:text-white",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Left Side - Actions */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/10"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-4.5 w-4.5" />
            </button>

            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/10">
                  <Bell className="h-4.5 w-4.5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 left-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-64 bg-background shadow-lg p-2"
              >
                <p className="text-sm font-medium text-foreground px-2 py-1 border-b">
                  الإشعارات
                </p>

                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <DropdownMenuItem
                      key={n.id}
                      className="text-sm text-foreground hover:bg-accent flex flex-col items-start px-2 py-1"
                    >
                      <span className="font-semibold">{n.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {n.description}
                      </span>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground px-2 py-2">
                    لا توجد إشعارات حالياً
                  </p>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/10">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-white/20 text-xs">
                      {userData?.firstName?.[0] || "م"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-background">
                <div className="p-3 text-right">
                  <p className="text-sm font-medium text-foreground">
                    {userData?.firstName} {userData?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {userData?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex-row-reverse justify-end text-sm text-foreground hover:bg-accent">
                  <User className="h-4 w-4 ml-2" />
                  الملف الشخصي
                </DropdownMenuItem>
                <DropdownMenuItem className="flex-row-reverse justify-end text-sm text-foreground hover:bg-accent">
                  <Settings className="h-4 w-4 ml-2" />
                  الإعدادات
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex-row-reverse justify-end text-sm text-destructive hover:bg-destructive/10"
                  onClick={() => navigate("/login")}
                >
                  <LogOut className="h-4 w-4 ml-2" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search Overlay */}
        {searchOpen && (
          <div
            dir="rtl"
            className="absolute top-full inset-x-0 bg-background border-b z-50"
          >
            <div className="px-4 lg:px-6 py-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="ابحث في المنتجات، الطلبات، العملاء..."
                    className="pr-10 pl-4 py-1.5 text-sm border-0 focus-visible:ring-0 text-right text-foreground"
                    value={tempSearchTerm}
                    onChange={(e) => setTempSearchTerm(e.target.value)}
                    onKeyDown={handleSearchKeyPress}
                    autoFocus
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <Button
                  onClick={handleSearchSubmit}
                  className="btn-gradient text-sm px-4 h-9"
                >
                  بحث
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Sub Tabs */}
      {currentSubTabs.length > 0 && (
        <div dir="rtl" className="sticky top-16 z-40 bg-background border-b">
          <div className="flex items-center justify-between px-4 lg:px-6 h-12">
            {/* Right Side - Sub Tabs with More Button */}
            <div className="flex gap-6 text-sm overflow-hidden">
              {/* التبويبات المرئية */}
              {visibleSubTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleSubTabClick(tab.id)}
                  className={cn(
                    "pb-2 border-b-2 transition-colors whitespace-nowrap",
                    activeSubTab === tab.id
                      ? "border-primary text-primary font-medium"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              ))}

              {/* زر المزيد إذا كان هناك أكثر من 5 تبويبات */}
              {shouldShowMore && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "pb-2 border-b-2 transition-colors flex items-center gap-1 whitespace-nowrap",
                        "border-transparent text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      المزيد
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="bg-background shadow-lg p-2 min-w-[150px]"
                  >
                    {hiddenSubTabs.map((tab) => (
                      <DropdownMenuItem
                        key={tab.id}
                        onClick={() => handleSubTabClick(tab.id)}
                        className={cn(
                          "flex-row-reverse justify-end text-sm px-2 py-1.5",
                          activeSubTab === tab.id
                            ? "bg-accent text-primary font-medium"
                            : "text-foreground hover:bg-accent",
                        )}
                      >
                        {tab.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Left Buttons Group */}
            <div className="flex items-center gap-2">
              {/* Add Button */}
              {(activeTab === "products" ||
                activeTab === "customers" ||
                activeTab === "orders") && (
                <Button
                  size="sm"
                  className="flex items-center gap-1.5 h-8 px-4 text-sm bg-success hover:bg-success/90 text-white transition-colors"
                  onClick={getAddButtonAction()}
                >
                  <Plus className="h-4 w-4" />
                  {activeTab === "products" && "إضافة منتج"}
                  {activeTab === "customers" && "إضافة عميل"}
                  {activeTab === "orders" && "طلب جديد"}
                </Button>
              )}

              {/* Help Button */}
              <button
                onClick={() => navigate("/help")}
                className="flex items-center gap-2 h-8 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
              >
                <HelpCircle className="h-4 w-4" />
                <span>مساعدة</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          dir="rtl"
          className="lg:hidden fixed inset-x-0 top-16 z-50 bg-gradient-to-r from-primary to-brand border-t"
        >
          <div className="px-4 py-5">
            {/* Mobile Navigation */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  className={cn(
                    "h-12 flex flex-col items-center justify-center gap-1 rounded",
                    activeTab === item.id
                      ? "bg-white text-primary font-medium"
                      : "bg-white/10 text-white/90 hover:bg-white/20",
                  )}
                  onClick={() => handleTabClick(item.id)}
                >
                  <span className="text-xs">{item.label}</span>
                </button>
              ))}
            </div>

            <Separator className="my-5 bg-white/20" />

            {/* Mobile Sub Tabs */}
            {currentSubTabs.length > 0 && (
              <div className="mb-5">
                <div className="flex flex-wrap gap-2">
                  {currentSubTabs.slice(0, 3).map((subTab) => (
                    <button
                      key={subTab.id}
                      className={cn(
                        "h-8 px-3 text-xs rounded",
                        activeSubTab === subTab.id
                          ? "bg-white text-primary font-medium border border-white"
                          : "bg-white/10 text-white/90 hover:bg-white/20 border border-white/20",
                      )}
                      onClick={() => {
                        handleSubTabClick(subTab.id);
                        setMobileMenuOpen(false);
                      }}
                    >
                      {subTab.label}
                    </button>
                  ))}

                  {currentSubTabs.length > 3 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="h-8 px-3 text-xs rounded bg-white/10 hover:bg-white/20 border border-white/20 text-white/90">
                          المزيد
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-40 bg-background"
                      >
                        {currentSubTabs.slice(3).map((subTab) => (
                          <DropdownMenuItem
                            key={subTab.id}
                            className="flex-row-reverse justify-end text-xs text-foreground hover:bg-accent"
                            onClick={() => {
                              handleSubTabClick(subTab.id);
                              setMobileMenuOpen(false);
                            }}
                          >
                            {subTab.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Actions */}
            <div className="space-y-4">
              <div className="relative">
                <input
                  placeholder="بحث..."
                  className="w-full pr-10 pl-3 py-2.5 rounded bg-white/10 border-0 text-white placeholder-white/50 text-sm text-right"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(activeTab === "products" ||
                  activeTab === "customers" ||
                  activeTab === "orders") && (
                  <button
                    className="py-3 rounded bg-success hover:bg-success/90 text-white text-sm flex items-center justify-center gap-1.5"
                    onClick={getAddButtonAction()}
                  >
                    <Plus className="h-4 w-4" />
                    {activeTab === "products" && "منتج جديد"}
                    {activeTab === "customers" && "عميل جديد"}
                    {activeTab === "orders" && "طلب جديد"}
                  </button>
                )}
                <button
                  className="py-3 rounded bg-white/10 hover:bg-white/20 text-white text-sm col-span-2 flex items-center justify-center gap-1.5"
                  onClick={() => navigate("/help")}
                >
                  <HelpCircle className="h-4 w-4" />
                  المساعدة والدعم
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Sidebar() {
  return null;
}
