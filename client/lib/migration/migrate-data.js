const admin = require("firebase-admin");
const serviceAccount = require("./service-account-key.json"); // احفظ ملف الخدمة هنا

// تهيئة Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function migrateAllData() {
  console.log("🚀 بدء هجرة البيانات إلى الهيكل الجديد...");
  console.log("⏰ الوقت المتوقع: 2-5 دقائق حسب حجم البيانات");

  try {
    // 1. هجرة جميع المتاجر
    console.log("\n📦 خطوة 1: هجرة المتاجر...");
    const storesSnapshot = await db.collection("stores").get();
    console.log(`   تم العثور على ${storesSnapshot.size} متجر`);

    let processedStores = 0;
    let processedCustomers = 0;
    let processedOrders = 0;

    for (const storeDoc of storesSnapshot.docs) {
      const storeId = storeDoc.id;
      const storeData = storeDoc.data();

      console.log(
        `\n   📊 معالجة المتجر: ${storeData.name || "بدون اسم"} (${storeId})`,
      );

      // 2. هجرة عملاء هذا المتجر
      console.log(`   👥 البحث عن عملاء المتجر...`);
      const customersSnapshot = await db
        .collection("customers")
        .where("storeId", "==", storeId)
        .get();

      console.log(`     تم العثور على ${customersSnapshot.size} عميل`);

      for (const customerDoc of customersSnapshot.docs) {
        const customerData = customerDoc.data();

        if (customerData.uid) {
          // نسخ العميل إلى المسار الجديد
          await db
            .collection("stores")
            .doc(storeId)
            .collection("customers")
            .doc(customerData.uid)
            .set({
              ...customerData,
              storeId: storeId,
              firstVisit:
                customerData.createdAt ||
                admin.firestore.FieldValue.serverTimestamp(),
              lastVisit:
                customerData.updatedAt ||
                admin.firestore.FieldValue.serverTimestamp(),
              migratedAt: admin.firestore.FieldValue.serverTimestamp(),
              migrationSource: "customers/" + customerDoc.id,
            });

          processedCustomers++;
        }
      }

      // 3. تحديث الطلبات بإضافة customerSnapshot
      console.log(`   📝 تحديث طلبات المتجر...`);
      const ordersSnapshot = await db
        .collection("orders")
        .where("storeId", "==", storeId)
        .get();

      console.log(`     تم العثور على ${ordersSnapshot.size} طلب`);

      for (const orderDoc of ordersSnapshot.docs) {
        const orderData = orderDoc.data();

        // البحث عن uid للعميل
        if (
          orderData.customerId &&
          !orderData.customerId.startsWith("guest_")
        ) {
          try {
            // حاول البحث في المجموعة القديمة أولاً
            const oldCustomerQuery = await db
              .collection("customers")
              .where("uid", "==", orderData.customerId)
              .where("storeId", "==", storeId)
              .limit(1)
              .get();

            if (!oldCustomerQuery.empty) {
              const customer = oldCustomerQuery.docs[0].data();

              await orderDoc.ref.update({
                customerSnapshot: {
                  uid: customer.uid,
                  email: customer.email || "",
                  firstName: customer.firstName || "",
                  lastName: customer.lastName || "",
                  phone: customer.phone || "",
                  shippingAddress: customer.shippingAddress || {},
                },
                migratedAt: admin.firestore.FieldValue.serverTimestamp(),
              });

              processedOrders++;
            } else {
              // إذا لم يتم العثور في المجموعة القديمة، ابحث في الجديدة
              const newCustomerDoc = await db
                .collection("stores")
                .doc(storeId)
                .collection("customers")
                .doc(orderData.customerId)
                .get();

              if (newCustomerDoc.exists) {
                const customer = newCustomerDoc.data();

                await orderDoc.ref.update({
                  customerSnapshot: {
                    uid: customer.uid,
                    email: customer.email || "",
                    firstName: customer.firstName || "",
                    lastName: customer.lastName || "",
                    phone: customer.phone || "",
                    shippingAddress: customer.shippingAddress || {},
                  },
                  migratedAt: admin.firestore.FieldValue.serverTimestamp(),
                });

                processedOrders++;
              }
            }
          } catch (error) {
            console.warn(
              `       ⚠️ خطأ في تحديث الطلب ${orderDoc.id}:`,
              error.message,
            );
          }
        }
      }

      processedStores++;
      console.log(`   ✅ اكتملت معالجة المتجر`);
    }

    // 4. هجرة السلة
    console.log("\n🛒 خطوة 4: هجرة سلة العملاء...");
    const cartsSnapshot = await db.collection("customerCarts").get();
    console.log(`   تم العثور على ${cartsSnapshot.size} سلة`);

    let processedCarts = 0;
    for (const cartDoc of cartsSnapshot.docs) {
      const cartData = cartDoc.data();

      // تحديث الحقول إذا لزم الأمر
      if (cartData.customerId && cartData.storeId) {
        await cartDoc.ref.update({
          migratedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        processedCarts++;
      }
    }

    // 5. هجرة المفضلات
    console.log("\n⭐ خطوة 5: هجرة المفضلات...");
    const favoritesSnapshot = await db.collection("customerFavorites").get();
    console.log(`   تم العثور على ${favoritesSnapshot.size} مفضلة`);

    let processedFavorites = 0;
    for (const favDoc of favoritesSnapshot.docs) {
      const favData = favDoc.data();

      if (favData.customerId && favData.storeId) {
        await favDoc.ref.update({
          migratedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        processedFavorites++;
      }
    }

    // 6. إنشاء فهرس للبحث السريع
    console.log("\n🔍 خطوة 6: إنشاء فهرس للبحث...");
    const indexBatch = db.batch();

    // إضافة حقل للبحث السريع في العملاء
    const allCustomers = await db.collectionGroup("customers").get();
    let indexedCustomers = 0;

    for (const customerDoc of allCustomers.docs) {
      const customerData = customerDoc.data();

      // إنشاء حقل بحث يجمع الأسماء والبريد
      const searchField =
        `${customerData.firstName || ""} ${customerData.lastName || ""} ${customerData.email || ""}`.toLowerCase();

      indexBatch.update(customerDoc.ref, {
        _search: searchField,
        indexedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      indexedCustomers++;

      // ارسال الدفعة كل 500 عملية
      if (indexedCustomers % 500 === 0) {
        await indexBatch.commit();
        console.log(`     تم فهرسة ${indexedCustomers} عميل`);
      }
    }

    if (indexedCustomers % 500 !== 0) {
      await indexBatch.commit();
    }

    // 7. سجل الهجرة
    console.log("\n📋 خطوة 7: إنشاء سجل الهجرة...");
    await db.collection("migrationLogs").add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      stats: {
        stores: processedStores,
        customers: processedCustomers,
        orders: processedOrders,
        carts: processedCarts,
        favorites: processedFavorites,
        indexedCustomers: indexedCustomers,
      },
      version: "2.0.0",
      status: "completed",
    });

    // 8. النتيجة النهائية
    console.log("\n🎉 اكتملت الهجرة بنجاح!");
    console.log("══════════════════════════════════════════");
    console.log("📊 إحصائيات الهجرة:");
    console.log(`   • المتاجر: ${processedStores}/${storesSnapshot.size}`);
    console.log(`   • العملاء: ${processedCustomers}`);
    console.log(`   • الطلبات: ${processedOrders}`);
    console.log(`   • السلة: ${processedCarts}/${cartsSnapshot.size}`);
    console.log(
      `   • المفضلات: ${processedFavorites}/${favoritesSnapshot.size}`,
    );
    console.log(`   • الفهرسة: ${indexedCustomers} عميل`);
    console.log("══════════════════════════════════════════");
    console.log("\n✅ النظام الجديد جاهز للاستخدام!");
    console.log("🔧 الخطوات التالية:");
    console.log("   1. تحديث تطبيق الواجهة");
    console.log("   2. اختبار النظام الجديد");
    console.log("   3. تعطيل النظام القديم بعد التأكد");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ فشلت الهجرة:", error);

    // حفظ خطأ الهجرة
    try {
      await db.collection("migrationErrors").add({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        error: error.message,
        stack: error.stack,
        status: "failed",
      });
    } catch (logError) {
      console.error("❌ فشل حفظ خطأ الهجرة:", logError);
    }

    process.exit(1);
  }
}

// تشغيل الهجرة
migrateAllData().catch(console.error);
