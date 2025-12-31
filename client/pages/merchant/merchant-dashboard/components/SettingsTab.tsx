import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HelpCircle,
  User,
  Ticket,
  Truck,
  Settings,
  Package,
  ArchiveIcon,
  CreditCard,
  Wallet,
  Shield,
  Receipt,
  Grid,
  ShoppingBag,
  BriefcaseIcon,
  CodeIcon,
  Activity,
  Download,
  Trash2,
  MessageSquareIcon,
  GiftIcon,
  Plus,
  Save,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { ChecklistItems, ExtendedStore } from "../types";
import { ShippingSettings, PaymentSettings } from "../types";

interface SettingsTabProps {
  store: ExtendedStore;
  shippingSettings: ShippingSettings;
  setShippingSettings: (settings: ShippingSettings) => void;
  paymentSettings: PaymentSettings;
  setPaymentSettings: (settings: PaymentSettings) => void;
  subActiveTab: string;
  setSubActiveTab: (tabId: string) => void;
  loadMerchantData: () => Promise<void>;
  showConfirmDialog: (
    title: string,
    message: string,
    onConfirm: () => void,
    type: "store" | "shipping" | "payment" | "design" | "customer" | "order",
  ) => void;
  handleSaveShippingSettings: () => Promise<void>;
  handleSavePaymentSettings: () => Promise<void>;
  savingShippingSettings: boolean;
  savingPaymentSettings: boolean;
  YEMENI_GOVERNORATES: string[];
  checklistItems?: ChecklistItems; // 🔥 إضافة
  updateChecklistItem;
}

export default function SettingsTab({
  store,
  shippingSettings,
  setShippingSettings,
  paymentSettings,
  setPaymentSettings,
  subActiveTab,
  setSubActiveTab,
  loadMerchantData,
  showConfirmDialog,
  handleSaveShippingSettings,
  handleSavePaymentSettings,
  savingShippingSettings,
  savingPaymentSettings,
  YEMENI_GOVERNORATES,
  checklistItems,
}: SettingsTabProps) {
  const settingsCategories = [
    {
      title: "الإعدادات والأدوات",
      items: [
        { id: "settings-tools", label: "مركز الدعم", icon: HelpCircle },
        { id: "faq", label: "الأسئلة والتقييمات", icon: HelpCircle },
        { id: "self-service", label: "نظام الخدمة الذاتية", icon: User },
        { id: "tickets", label: "التذاكر", icon: Ticket },
      ],
    },
    {
      title: "سلة شات",
      items: [{ id: "chat", label: "الشكاوى", icon: MessageSquareIcon }],
    },
    {
      title: "الشحن",
      items: [
        { id: "shipping-companies", label: "شركات الشحن", icon: Truck },
        { id: "shipping-settings", label: "إعدادات الشحن", icon: Settings },
        { id: "packaging", label: "مواد التغليف", icon: Package },
        { id: "archives", label: "أرشيف البوليصات", icon: ArchiveIcon },
      ],
    },
    {
      title: "الدفع",
      items: [
        { id: "payment-methods", label: "طرق الدفع", icon: CreditCard },
        { id: "wallet", label: "المحفظة والفواتير", icon: Wallet },
        { id: "payment-restrictions", label: "قيود الدفع", icon: Shield },
        { id: "vat", label: "ضريبة القيمة المضافة", icon: Receipt },
        {
          id: "e-payment",
          label: "عمليات الدفع الإلكتروني",
          icon: CreditCard,
        },
      ],
    },
    {
      title: "الأدوات المساعدة",
      items: [
        { id: "apps", label: "التطبيقات المثبتة", icon: Grid },
        { id: "app-store", label: "متجر التطبيقات", icon: ShoppingBag },
        {
          id: "merchant-services",
          label: "خدمات التاجر",
          icon: BriefcaseIcon,
        },
        { id: "developer-tools", label: "أدوات المطور", icon: CodeIcon },
      ],
    },
    {
      title: "السجلات",
      items: [
        { id: "activity-log", label: "سجل العمليات", icon: Activity },
        { id: "export-log", label: "سجل التصدير", icon: Download },
        { id: "inventory-log", label: "سجل المخزون", icon: Package },
        { id: "deleted-orders", label: "سجل الطلبات المحذوفة", icon: Trash2 },
        {
          id: "deleted-products",
          label: "سجل المنتجات المحذوفة",
          icon: Trash2,
        },
        { id: "gift-cards", label: "سجل البطاقات الرقمية", icon: GiftIcon },
        {
          id: "sms-log",
          label: "سجل الرسائل النصية",
          icon: MessageSquareIcon,
        },
      ],
    },
  ];

  // دوال إدارة الشحن
  const handleAddShippingZone = () => {
    const newZone = {
      id: Date.now().toString(),
      name: `منطقة ${shippingSettings.shippingZones.length + 1}`,
      governorates: [YEMENI_GOVERNORATES[0]],
      cost: 2000,
      estimatedDays: "2-5 أيام",
      enabled: true,
    };

    setShippingSettings({
      ...shippingSettings,
      shippingZones: [...shippingSettings.shippingZones, newZone],
    });
  };

  const handleAddShippingMethod = () => {
    const newMethod = {
      id: Date.now().toString(),
      name: `طريقة ${shippingSettings.shippingMethods.length + 1}`,
      cost: 1000,
      days: "1-3 أيام",
      enabled: true,
    };

    setShippingSettings({
      ...shippingSettings,
      shippingMethods: [...shippingSettings.shippingMethods, newMethod],
    });
  };

  const handleUpdateShippingZone = (id: string, updates: any) => {
    setShippingSettings({
      ...shippingSettings,
      shippingZones: shippingSettings.shippingZones.map((zone) =>
        zone.id === id ? { ...zone, ...updates } : zone,
      ),
    });
  };

  const handleDeleteShippingZone = (id: string) => {
    setShippingSettings({
      ...shippingSettings,
      shippingZones: shippingSettings.shippingZones.filter(
        (zone) => zone.id !== id,
      ),
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* <div className="w-full lg:w-72">
        <Card className="lg:sticky lg:top-6">
          <ScrollArea className="h-[700px]">
            <CardContent className="p-4">
              {settingsCategories.map((category, index) => (
                <div key={index} className="mb-6">
                  <h3 className="font-medium mb-2 text-right text-sm text-muted-foreground">
                    {category.title}
                  </h3>
                  <div className="space-y-1">
                    {category.items.map((item) => (
                      <Button
                        key={item.id}
                        variant={
                          subActiveTab === item.id ? "secondary" : "ghost"
                        }
                        className="w-full justify-start flex-row-reverse mb-1"
                        onClick={() => setSubActiveTab(item.id)}
                      >
                        <item.icon className="h-4 w-4 ml-3" />
                        {item.label}
                      </Button>
                    ))}
                  </div>
                  {index < settingsCategories.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </CardContent>
          </ScrollArea>
        </Card>
      </div> */}

      <div className="flex-1">
        {subActiveTab === "settings-tools" && (
          <Card>
            <CardHeader>
              <CardTitle>مركز الدعم</CardTitle>
              <CardDescription>إدارة طلبات الدعم والتذاكر</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">مركز الدعم والتذاكر</p>
              </div>
            </CardContent>
          </Card>
        )}

        {subActiveTab === "shipping-settings" && (
          <div className="space-y-6">
            <div className="text-right">
              <h2 className="text-2xl font-bold">إعدادات الشحن</h2>
              <p className="text-muted-foreground">
                إدارة سياسات الشحن والتكاليف حسب المحافظة
              </p>
            </div>

            <Card>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <p className="font-medium">تفعيل نظام الشحن</p>
                    <p className="text-sm text-muted-foreground">
                      تفعيل أو تعطيل خيارات الشحن
                    </p>
                  </div>
                  <Switch
                    checked={shippingSettings.enabled}
                    onCheckedChange={(checked) =>
                      setShippingSettings({
                        ...shippingSettings,
                        enabled: checked,
                      })
                    }
                  />
                </div>

                {shippingSettings.enabled && (
                  <>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>تكلفة الشحن الافتراضية</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={shippingSettings.shippingCost}
                            onChange={(e) =>
                              setShippingSettings({
                                ...shippingSettings,
                                shippingCost: parseInt(e.target.value) || 0,
                              })
                            }
                            className="text-right"
                          />
                          <span className="text-sm">ريال يمني</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>حد الشحن المجاني</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={shippingSettings.freeShippingThreshold}
                            onChange={(e) =>
                              setShippingSettings({
                                ...shippingSettings,
                                freeShippingThreshold:
                                  parseInt(e.target.value) || 0,
                              })
                            }
                            className="text-right"
                          />
                          <span className="text-sm">ريال يمني</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          الشحن مجاني للطلبات فوق هذا المبلغ
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">
                          مناطق الشحن حسب المحافظة
                        </h3>
                        <Button size="sm" onClick={handleAddShippingZone}>
                          <Plus className="h-4 w-4 ml-2" />
                          إضافة منطقة
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {shippingSettings.shippingZones.map((zone) => (
                          <Card key={zone.id}>
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <div className="text-right">
                                    <p className="font-medium">{zone.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {zone.estimatedDays} • {zone.cost} ريال
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={zone.enabled}
                                      onCheckedChange={(checked) =>
                                        handleUpdateShippingZone(zone.id, {
                                          enabled: checked,
                                        })
                                      }
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleDeleteShippingZone(zone.id)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>المحافظات المغطاة</Label>
                                  <Select
                                    value={zone.governorates[0]}
                                    onValueChange={(value) =>
                                      handleUpdateShippingZone(zone.id, {
                                        governorates: [value],
                                      })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="اختر المحافظات" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {YEMENI_GOVERNORATES.map((gov) => (
                                        <SelectItem key={gov} value={gov}>
                                          {gov}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>تكلفة الشحن</Label>
                                  <Input
                                    type="number"
                                    value={zone.cost}
                                    onChange={(e) =>
                                      handleUpdateShippingZone(zone.id, {
                                        cost: parseInt(e.target.value) || 0,
                                      })
                                    }
                                    className="text-right"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">طرق الشحن المتاحة</h3>
                        <Button size="sm" onClick={handleAddShippingMethod}>
                          <Plus className="h-4 w-4 ml-2" />
                          إضافة طريقة
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {shippingSettings.shippingMethods.map((method) => (
                          <div
                            key={method.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="text-right">
                              <p className="font-medium">{method.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {method.days} • {method.cost} ريال
                              </p>
                            </div>
                            <Switch
                              checked={method.enabled}
                              onCheckedChange={(checked) =>
                                setShippingSettings({
                                  ...shippingSettings,
                                  shippingMethods:
                                    shippingSettings.shippingMethods.map((m) =>
                                      m.id === method.id
                                        ? { ...m, enabled: checked }
                                        : m,
                                    ),
                                })
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={handleSaveShippingSettings}
                        disabled={savingShippingSettings}
                      >
                        {savingShippingSettings ? (
                          <>
                            <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                            جاري الحفظ...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 ml-2" />
                            حفظ إعدادات الشحن
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {subActiveTab === "payment-methods" && (
          <div className="space-y-6">
            <div className="text-right">
              <h2 className="text-2xl font-bold">بوابات الدفع</h2>
              <p className="text-muted-foreground">
                إدارة طرق الدفع المتاحة في متجرك
              </p>
            </div>

            <Card>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <p className="font-medium">الدفع عند الاستلام</p>
                      <p className="text-sm text-muted-foreground">
                        الدفع نقداً عند استلام المنتج
                      </p>
                    </div>
                    <Switch
                      checked={paymentSettings.cashOnDelivery}
                      onCheckedChange={(checked) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          cashOnDelivery: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <p className="font-medium">التحويل البنكي</p>
                      <p className="text-sm text-muted-foreground">
                        الدفع عن طريق التحويل المصرفي
                      </p>
                    </div>
                    <Switch
                      checked={paymentSettings.bankTransfer}
                      onCheckedChange={(checked) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          bankTransfer: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <p className="font-medium">بطاقات الائتمان</p>
                      <p className="text-sm text-muted-foreground">
                        الدفع ببطاقات Visa/Mastercard
                      </p>
                    </div>
                    <Switch
                      checked={paymentSettings.creditCard}
                      onCheckedChange={(checked) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          creditCard: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <p className="font-medium">مدى</p>
                      <p className="text-sm text-muted-foreground">
                        نظام الدفع الإلكتروني (مدى)
                      </p>
                    </div>
                    <Switch
                      checked={paymentSettings.mada}
                      onCheckedChange={(checked) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          mada: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <p className="font-medium">محفظة إلكترونية</p>
                      <p className="text-sm text-muted-foreground">
                        الدفع عبر المحافظ الإلكترونية المحلية
                      </p>
                    </div>
                    <Switch
                      checked={paymentSettings.mobileWallet}
                      onCheckedChange={(checked) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          mobileWallet: checked,
                        })
                      }
                    />
                  </div>
                </div>

                <Separator />

                {paymentSettings.bankTransfer && (
                  <div>
                    <h3 className="font-medium mb-4">معلومات الحساب البنكي</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>اسم البنك</Label>
                        <Input
                          value={paymentSettings.bankInfo.bankName}
                          onChange={(e) =>
                            setPaymentSettings({
                              ...paymentSettings,
                              bankInfo: {
                                ...paymentSettings.bankInfo,
                                bankName: e.target.value,
                              },
                            })
                          }
                          placeholder="اسم البنك"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>رقم الحساب</Label>
                        <Input
                          value={paymentSettings.bankInfo.accountNumber}
                          onChange={(e) =>
                            setPaymentSettings({
                              ...paymentSettings,
                              bankInfo: {
                                ...paymentSettings.bankInfo,
                                accountNumber: e.target.value,
                              },
                            })
                          }
                          placeholder="رقم الحساب"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>اسم صاحب الحساب</Label>
                        <Input
                          value={paymentSettings.bankInfo.accountName}
                          onChange={(e) =>
                            setPaymentSettings({
                              ...paymentSettings,
                              bankInfo: {
                                ...paymentSettings.bankInfo,
                                accountName: e.target.value,
                              },
                            })
                          }
                          placeholder="اسم صاحب الحساب"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>IBAN (اختياري)</Label>
                        <Input
                          value={paymentSettings.bankInfo.iban}
                          onChange={(e) =>
                            setPaymentSettings({
                              ...paymentSettings,
                              bankInfo: {
                                ...paymentSettings.bankInfo,
                                iban: e.target.value,
                              },
                            })
                          }
                          placeholder="IBAN"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>SWIFT Code (اختياري)</Label>
                        <Input
                          value={paymentSettings.bankInfo.swiftCode}
                          onChange={(e) =>
                            setPaymentSettings({
                              ...paymentSettings,
                              bankInfo: {
                                ...paymentSettings.bankInfo,
                                swiftCode: e.target.value,
                              },
                            })
                          }
                          placeholder="SWIFT Code"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={handleSavePaymentSettings}
                    disabled={savingPaymentSettings}
                  >
                    {savingPaymentSettings ? (
                      <>
                        <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 ml-2" />
                        حفظ إعدادات الدفع
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
