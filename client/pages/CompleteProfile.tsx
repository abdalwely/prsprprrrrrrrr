// D:\New folder (2)\store\client\pages\CompleteProfile.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, MapPin, Camera, ArrowRight } from "lucide-react";
import { customerService } from "@/lib/firestore";

export default function CompleteProfile() {
  const [formData, setFormData] = useState({
    phone: "",
    city: "",
    district: "",
    street: "",
    postalCode: "",
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const userData = location.state?.userData;

  useEffect(() => {
    if (!userData) {
      toast({
        title: "خطأ في البيانات",
        description: "بيانات المستخدم غير متوفرة",
        variant: "destructive",
      });
      navigate("/signup");
    }
  }, [userData, navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. حفظ بيانات العميل في مجموعة customers
      const customerData = {
        uid: userData.uid,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: formData.phone,
        userType: "customer" as const,
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          district: formData.district,
          postalCode: formData.postalCode,
          country: "اليمن",
        },
        isActive: true,
      };

      const customerId = await customerService.create(customerData);

      // 2. تحديث بيانات المستخدم في مجموعة users
      // (سيتم في AuthContext تلقائياً)

      toast({
        title: "تم الحفظ بنجاح! 🎉",
        description: "تم حفظ بياناتك الشخصية بنجاح",
      });

      // 3. الانتقال إلى لوحة تحكم العميل
      navigate("/customer/dashboard");
    } catch (error) {
      console.error("❌ خطأ في حفظ البيانات:", error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ بياناتك",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">أكمل بياناتك الشخصية</CardTitle>
          <p className="text-gray-600">أكمل معلوماتك لتجربة أفضل</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* صورة الملف الشخصي (اختيارية) */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-lg overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="profileImage"
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  <input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الجوال</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="77xxxxxxxx"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">المدينة</Label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="المدينة"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">العنوان التفصيلي</Label>
              <Input
                id="street"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                placeholder="اسم الشارع، الحي، رقم المنزل"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">الحي / المنطقة</Label>
                <Input
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  placeholder="اسم الحي"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">الرمز البريدي</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="12345"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/customer/dashboard")}
              >
                تخطي الآن
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? "جاري الحفظ..." : "حفظ البيانات"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              يمكنك تخطي هذه الخطوة الآن وإكمال بياناتك لاحقاً من إعدادات الحساب
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
