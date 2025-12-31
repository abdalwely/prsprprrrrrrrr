// // D:\New folder (2)\store\client\pages\merchant\CreateStore.tsx
// import { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "@/lib/firebase";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useToast } from "@/hooks/use-toast";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import {
//   Store,
//   Mail,
//   CheckCircle,
//   AlertTriangle,
//   ArrowRight,
//   Settings,
//   Palette,
// } from "lucide-react";
// import { resendEmailVerification, isEmailVerified } from "@/lib/auth-enhanced";
// import { submitStoreApplication } from "@/lib/store-approval-system";

// export default function CreateStore() {
//   const [loading, setLoading] = useState(false);
//   const [resendLoading, setResendLoading] = useState(false);
//   const [user, setUser] = useState<any>(null);
//   const [emailVerified, setEmailVerified] = useState(false);
//   const { toast } = useToast();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const { email, userId, userData } = location.state || {};

//   useEffect(() => {
//     if (!email || !userId || !userData) {
//       toast({
//         title: "بيانات غير مكتملة",
//         description: "يرجى إنشاء الحساب أولاً",
//         variant: "destructive",
//       });
//       navigate("/signup");
//       return;
//     }

//     // مراقبة حالة المصادقة والتحقق
//     const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
//       if (currentUser) {
//         setUser(currentUser);
//         setEmailVerified(currentUser.emailVerified);

//         // إذا تم التحقق، تحديث البيانات المحلية
//         if (currentUser.emailVerified) {
//           const pendingData = JSON.parse(
//             localStorage.getItem("pendingMerchant") || "{}",
//           );
//           localStorage.setItem(
//             "pendingMerchant",
//             JSON.stringify({
//               ...pendingData,
//               isEmailVerified: true,
//             }),
//           );
//         }
//       }
//     });

//     return () => unsubscribe();
//   }, [email, userId, userData, navigate, toast]);

//   const handleResendVerification = async () => {
//     if (!user) return;

//     setResendLoading(true);
//     try {
//       await resendEmailVerification(user);
//       toast({
//         title: "تم إعادة الإرسال ✅",
//         description: "تم إرسال رابط تحقق جديد إلى بريدك الإلكتروني",
//       });
//     } catch (error: any) {
//       toast({
//         title: "خطأ في الإرسال",
//         description: "لم نتمكن من إرسال رابط التحقق",
//         variant: "destructive",
//       });
//     } finally {
//       setResendLoading(false);
//     }
//   };

//   const handleCheckVerification = async () => {
//     if (!user) return;

//     try {
//       await user.reload();
//       setEmailVerified(user.emailVerified);

//       if (user.emailVerified) {
//         toast({
//           title: "تم التحقق بنجاح! ✅",
//           description: "تم تأكيد بريدك الإلكتروني بنجاح",
//         });
//       } else {
//         toast({
//           title: "لم يتم التحقق بعد",
//           description: "لم تقم بالتحقق من بريدك الإلكتروني بعد",
//           variant: "destructive",
//         });
//       }
//     } catch (error) {
//       toast({
//         title: "خطأ في التحقق",
//         description: "حدث خطأ أثناء التحقق من حالة البريد",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleCreateStore = async () => {
//     if (!userData) return;

//     setLoading(true);
//     try {
//       // ✅ إرسال طلب إنشاء المتجر
//       const applicationId = await submitStoreApplication(
//         userData.uid,
//         {
//           firstName: userData.firstName,
//           lastName: userData.lastName,
//           email: userData.email,
//           phone: userData.phone,
//           city: userData.city,
//           businessName: userData.businessName,
//           businessType: userData.businessType,
//           emailVerified: emailVerified, // ✅ إضافة حالة التحقق
//         },
//         userData.storeData || {
//           template: "modern",
//           customization: {
//             colors: {
//               primary: "#FF6B35",
//               secondary: "#4A90E2",
//               background: "#FFFFFF",
//             },
//             storeName: userData.businessName,
//             storeDescription: `متجر ${userData.businessName} - ${userData.businessType}`,
//           },
//         },
//       );

//       console.log("✅ تم إرسال طلب المتجر:", applicationId);

//       // ✅ حفظ البيانات النهائية
//       localStorage.setItem("merchant_application_id", applicationId);

//       toast({
//         title: "تم إرسال طلب متجرك! 📋",
//         description: "طلبك قيد المراجعة. ستتلقى إشعاراً عند الموافقة.",
//         duration: 6000,
//       });

//       // ✅ الانتقال إلى صفحة الانتظار
//       navigate("/merchant/pending", {
//         state: {
//           applicationId,
//           email: userData.email,
//           businessName: userData.businessName,
//         },
//         replace: true,
//       });
//     } catch (error: any) {
//       console.error("❌ خطأ في إنشاء المتجر:", error);
//       toast({
//         title: "خطأ في إنشاء المتجر",
//         description: "حدث خطأ أثناء إرسال طلب متجرك",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const canCreateStore =
//     userData && userData.businessName && userData.businessType;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
//       <Card className="w-full max-w-2xl">
//         <CardHeader className="text-center">
//           <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
//             <Store className="h-8 w-8 text-blue-600" />
//           </div>
//           <CardTitle className="text-2xl">إنشاء متجرك</CardTitle>
//           <p className="text-gray-600 mt-2">
//             أكمل إنشاء متجرك {userData?.businessName}
//           </p>
//         </CardHeader>

//         <CardContent className="space-y-6">
//           {/* تنبيه حالة التحقق */}
//           {!emailVerified && (
//             <Alert
//               variant="destructive"
//               className="border-orange-200 bg-orange-50"
//             >
//               <AlertTriangle className="h-4 w-4 text-orange-600" />
//               <AlertDescription className="text-orange-800">
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <strong>بريدك الإلكتروني غير مفعل</strong>
//                     <p className="text-sm mt-1">
//                       يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب بالكامل
//                     </p>
//                   </div>
//                   <div className="flex gap-2">
//                     <Button
//                       onClick={handleCheckVerification}
//                       variant="outline"
//                       size="sm"
//                       className="border-orange-300 text-orange-700"
//                     >
//                       <CheckCircle className="h-4 w-4 mr-2" />
//                       تحقق
//                     </Button>
//                     <Button
//                       onClick={handleResendVerification}
//                       variant="outline"
//                       size="sm"
//                       disabled={resendLoading}
//                       className="border-orange-300 text-orange-700"
//                     >
//                       <Mail className="h-4 w-4 mr-2" />
//                       إعادة إرسال
//                     </Button>
//                   </div>
//                 </div>
//               </AlertDescription>
//             </Alert>
//           )}

//           {emailVerified && (
//             <Alert variant="default" className="border-green-200 bg-green-50">
//               <CheckCircle className="h-4 w-4 text-green-600" />
//               <AlertDescription className="text-green-800">
//                 <strong>بريدك الإلكتروني مفعل ✅</strong>
//                 <p className="text-sm mt-1">يمكنك الآن إنشاء متجرك بالكامل</p>
//               </AlertDescription>
//             </Alert>
//           )}

//           {/* معلومات المتجر */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <Card>
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-lg flex items-center gap-2">
//                   <Settings className="h-5 w-5" />
//                   معلومات المتجر
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">اسم المتجر:</span>
//                   <span className="font-medium">{userData?.businessName}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">نوع النشاط:</span>
//                   <span className="font-medium">{userData?.businessType}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">المدينة:</span>
//                   <span className="font-medium">{userData?.city}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">البريد:</span>
//                   <span className="font-medium">{userData?.email}</span>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-lg flex items-center gap-2">
//                   <Palette className="h-5 w-5" />
//                   التصميم
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">القالب:</span>
//                   <span className="font-medium">
//                     {userData?.storeData?.template || "حديث"}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">اللون الأساسي:</span>
//                   <div className="flex items-center gap-2">
//                     <div
//                       className="w-4 h-4 rounded border"
//                       style={{
//                         backgroundColor:
//                           userData?.storeData?.customization?.colors?.primary ||
//                           "#FF6B35",
//                       }}
//                     ></div>
//                     <span className="font-medium">
//                       {userData?.storeData?.customization?.colors?.primary ||
//                         "#FF6B35"}
//                     </span>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* أزرار التحكم */}
//           <div className="flex justify-between pt-4">
//             <Button variant="outline" onClick={() => navigate("/signup")}>
//               تعديل البيانات
//             </Button>

//             <div className="flex gap-3">
//               <Button
//                 onClick={handleCheckVerification}
//                 variant="outline"
//                 disabled={emailVerified}
//               >
//                 <CheckCircle className="h-4 w-4 mr-2" />
//                 تحقق من البريد
//               </Button>

//               <Button
//                 onClick={handleCreateStore}
//                 disabled={loading || !canCreateStore}
//                 className="flex items-center gap-2"
//               >
//                 {loading ? (
//                   "جاري الإرسال..."
//                 ) : (
//                   <>
//                     إرسال طلب المتجر
//                     <ArrowRight className="h-4 w-4" />
//                   </>
//                 )}
//               </Button>
//             </div>
//           </div>

//           {/* معلومات إضافية */}
//           <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
//             <h4 className="font-medium text-blue-900 mb-2">معلومات مهمة:</h4>
//             <ul className="text-blue-700 text-sm space-y-1">
//               <li>
//                 • يمكنك إرسال طلب المتجر حتى بدون تحقق البريد، لكن ننصح بالتحقق
//               </li>
//               <li>• التحقق من البريد يزيد من مصداقية متجرك</li>
//               <li>• ستتلقى إشعاراً عند موافقة المشرف على متجرك</li>
//               <li>• مدة المراجعة عادة من 1-3 أيام عمل</li>
//             </ul>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
