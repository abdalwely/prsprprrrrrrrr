import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2, User, ShoppingBag, MapPin, Lock } from "lucide-react";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { customerService } from "@/lib/firestore";
import { getCurrentStoreId } from "@/lib/firebase";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  // بيانات المستخدم
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // العنوان
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("اليمن");

  // بيانات إضافية
  const [customerId, setCustomerId] = useState("");
  const [guestId, setGuestId] = useState("");
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  // الحصول على بيانات المستخدم
  const userData = getCurrentCustomer();

  // تحميل بيانات الملف الشخصي
  useEffect(() => {
    async function loadProfileData() {
      try {
        setLoading(true);

        // إذا كان هناك مستخدم مسجل
        if (userData?.uid) {
          setCustomerId(userData.uid);
          setEmail(userData.email || "");

          // جلب storeId الحالي
          const storeId = await getCurrentStoreId();

          if (storeId) {
            // جلب بيانات العميل من المتجر
            const storeCustomer = await customerService.getStoreCustomer(
              storeId,
              userData.uid,
            );

            if (storeCustomer) {
              setFirstName(storeCustomer.firstName || "");
              setLastName(storeCustomer.lastName || "");
              setPhone(storeCustomer.phone || "");

              if (storeCustomer.shippingAddress) {
                const addr = storeCustomer.shippingAddress;
                setAddress(addr.street || "");
                setCity(addr.city || "");
                setGovernorate(addr.governorate || "");
                setZipCode(addr.zipCode || "");
                setCountry(addr.country || "اليمن");
              }

              // يمكنك جلب إحصائيات الطلبات هنا
              // const orders = await orderService.getByCustomer(userData.uid);
              // setTotalOrders(orders.length);
              // setTotalSpent(orders.reduce((sum, o) => sum + o.total, 0));
            }
          }
        }
        // إذا كان ضيفاً
        else {
          const storeId = await getCurrentStoreId();
          if (storeId) {
            const visitorKey = `visitor_${storeId}`;
            const visitorId = localStorage.getItem(visitorKey);

            if (visitorId) {
              setGuestId(visitorId);
              toast({
                title: "أنت تستخدم حساب ضيف",
                description: "سجل حساباً لحفظ بياناتك وطلباتك",
                variant: "default",
              });
            }
          }
        }
      } catch (err) {
        console.error("❌ خطأ في تحميل بيانات الملف الشخصي:", err);
        toast({
          title: "خطأ في تحميل البيانات",
          description: "تعذر تحميل معلومات الملف الشخصي",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadProfileData();
  }, [userData, toast]);

  // حفظ البيانات الشخصية
  const handleSavePersonalInfo = async () => {
    if (!userData?.uid) {
      toast({
        title: "غير مسجل",
        description: "يجب تسجيل الدخول لحفظ البيانات",
        variant: "destructive",
      });
      return;
    }

    const storeId = await getCurrentStoreId();
    if (!storeId) {
      toast({
        title: "لم يتم تحديد متجر",
        description: "يجب تحديد متجر أولاً",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // تحديث بيانات العميل في المتجر المحدد
      await customerService.update(userData.uid, {
        firstName,
        lastName,
        phone,
        storeId,
        shippingAddress: {
          street: address,
          city,
          governorate,
          country,
          zipCode,
          district: "",
          state: "",
        },
      });

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث معلوماتك الشخصية",
      });
    } catch (err) {
      console.error("❌ خطأ في حفظ البيانات الشخصية:", err);
      toast({
        title: "خطأ في الحفظ",
        description: "تعذر تحديث المعلومات",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // تغيير كلمة المرور
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "حقول مطلوبة",
        description: "يرجى ملء جميع حقول كلمة المرور",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "كلمة المرور غير متطابقة",
        description: "تأكد من تطابق كلمتي المرور الجديدة",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "كلمة مرور قصيرة",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // هنا يجب تنفيذ منطق تغيير كلمة المرور
      // في Firebase، تحتاج لإعادة المصادقة لتغيير كلمة المرور

      toast({
        title: "طلب تغيير كلمة المرور",
        description: "تم استلام طلب تغيير كلمة المرور",
      });

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("❌ خطأ في تغيير كلمة المرور:", err);
      toast({
        title: "خطأ في تغيير كلمة المرور",
        description: "تعذر تغيير كلمة المرور",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // الانتقال للتسجيل
  const handleRegister = () => {
    navigate("/customer/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">الملف الشخصي</h1>
            <p className="text-muted-foreground">
              {userData ? "إدارة حسابك وتفضيلاتك" : "أنت تستخدم حساب ضيف"}
            </p>
          </div>

          {!userData && (
            <Button onClick={handleRegister}>تسجيل حساب دائم</Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* العمود الأيسر: المعلومات العامة */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg">
                      {userData
                        ? `${firstName} ${lastName}`.trim() || "مستخدم"
                        : "ضيف"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {email || "غير محدد"}
                    </p>
                  </div>

                  <div className="w-full space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">رقم العضو:</span>
                      <span className="font-medium">
                        {customerId || guestId}
                      </span>
                    </div>

                    {totalOrders > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الطلبات:</span>
                        <span className="font-medium">{totalOrders}</span>
                      </div>
                    )}

                    {totalSpent > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          إجمالي المشتريات:
                        </span>
                        <span className="font-medium">
                          {totalSpent.toLocaleString()} ريال
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* العمود الأيمن: المحتوى الرئيسي */}
          <div className="lg:col-span-3">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">
                  <User className="ml-2 h-4 w-4" />
                  المعلومات الشخصية
                </TabsTrigger>
                <TabsTrigger value="address">
                  <MapPin className="ml-2 h-4 w-4" />
                  عنوان الشحن
                </TabsTrigger>
                <TabsTrigger value="password">
                  <Lock className="ml-2 h-4 w-4" />
                  كلمة المرور
                </TabsTrigger>
              </TabsList>

              {/* علامة تبويب المعلومات الشخصية */}
              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>المعلومات الشخصية</CardTitle>
                    <CardDescription>
                      قم بتحديث معلوماتك الشخصية وكيفية التواصل معك
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="profile-firstName">الاسم الأول</Label>
                        <Input
                          id="profile-firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          disabled={!userData}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-lastName">اسم العائلة</Label>
                        <Input
                          id="profile-lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          disabled={!userData}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profile-email">البريد الإلكتروني</Label>
                      <Input
                        id="profile-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!userData}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profile-phone">رقم الهاتف</Label>
                      <Input
                        id="profile-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={!userData}
                      />
                    </div>

                    {userData ? (
                      <Button
                        onClick={handleSavePersonalInfo}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            جاري الحفظ...
                          </>
                        ) : (
                          "حفظ التغييرات"
                        )}
                      </Button>
                    ) : (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                        <p className="text-amber-800">
                          ⚠️ أنت تستخدم حساب ضيف. سجل حساباً دائماً لحفظ
                          معلوماتك.
                        </p>
                        <Button
                          onClick={handleRegister}
                          className="mt-2"
                          variant="outline"
                        >
                          تسجيل حساب دائم
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* علامة تبويب عنوان الشحن */}
              <TabsContent value="address">
                <Card>
                  <CardHeader>
                    <CardTitle>عنوان الشحن</CardTitle>
                    <CardDescription>
                      قم بتحديث عنوان الشحن الافتراضي الخاص بك
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address-street">العنوان التفصيلي</Label>
                      <Input
                        id="address-street"
                        placeholder="الشارع، الحي، رقم المنزل"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        disabled={!userData}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="address-city">المدينة</Label>
                        <Input
                          id="address-city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          disabled={!userData}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address-governorate">المحافظة</Label>
                        <select
                          id="address-governorate"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={governorate}
                          onChange={(e) => setGovernorate(e.target.value)}
                          disabled={!userData}
                        >
                          <option value="">اختر المحافظة</option>
                          <option value="صنعاء">صنعاء</option>
                          <option value="عدن">عدن</option>
                          <option value="تعز">تعز</option>
                          <option value="الحديدة">الحديدة</option>
                          <option value="حضرموت">حضرموت</option>
                          <option value="إب">إب</option>
                          <option value="ذمار">ذمار</option>
                          <option value="المكلا">المكلا</option>
                          <option value="مأرب">مأرب</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="address-zipCode">الرمز البريدي</Label>
                        <Input
                          id="address-zipCode"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          disabled={!userData}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address-country">الدولة</Label>
                        <Input
                          id="address-country"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          disabled={!userData}
                        />
                      </div>
                    </div>

                    {userData ? (
                      <Button
                        onClick={handleSavePersonalInfo}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            جاري الحفظ...
                          </>
                        ) : (
                          "حفظ العنوان"
                        )}
                      </Button>
                    ) : (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                        <p className="text-amber-800">
                          ⚠️ أنت تستخدم حساب ضيف. سجل حساباً دائماً لحفظ عنوان
                          الشحن.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* علامة تبويب كلمة المرور */}
              <TabsContent value="password">
                <Card>
                  <CardHeader>
                    <CardTitle>تغيير كلمة المرور</CardTitle>
                    <CardDescription>
                      تأكد من استخدام كلمة مرور قوية لحماية حسابك
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {userData ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="current-password">
                            كلمة المرور الحالية
                          </Label>
                          <Input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="new-password">
                            كلمة المرور الجديدة
                          </Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">
                            تأكيد كلمة المرور الجديدة
                          </Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>

                        <Button
                          onClick={handleChangePassword}
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                              جاري التحديث...
                            </>
                          ) : (
                            "تغيير كلمة المرور"
                          )}
                        </Button>
                      </>
                    ) : (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                        <p className="text-amber-800">
                          ⚠️ هذه الميزة متاحة فقط للمستخدمين المسجلين.
                        </p>
                        <Button onClick={handleRegister} className="mt-2">
                          تسجيل حساب جديد
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
