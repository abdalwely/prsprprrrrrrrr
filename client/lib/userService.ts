import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "admin" | "merchant" | "customer" | "pending_merchant";
  status: "active" | "pending" | "suspended";
  stores?: string[];
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  avatar?: string;
  city?: string;
  country?: string;
  userType?: string; // للحفاظ على التوافق مع الملفات الحالية
}

export const userService = {
  // جلب جميع المستخدمين
  async getAllUsers(): Promise<User[]> {
    try {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          role: data.role || data.userType || "customer",
          status: data.status || "active",
          stores: data.stores || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate(),
          avatar: data.avatar || "",
          city: data.city || "",
          country: data.country || "",
          userType: data.userType || data.role || "customer",
        } as User;
      });

      return usersList;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // جلب المستخدمين حسب الدور
  async getUsersByRole(role: User["role"]): Promise<User[]> {
    try {
      const usersCollection = collection(db, "users");
      const q = query(usersCollection, where("role", "==", role));
      const usersSnapshot = await getDocs(q);
      const usersList = usersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          role: data.role || data.userType || "customer",
          status: data.status || "active",
          stores: data.stores || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate(),
          avatar: data.avatar || "",
          city: data.city || "",
          country: data.country || "",
          userType: data.userType || data.role || "customer",
        } as User;
      });

      return usersList;
    } catch (error) {
      console.error("Error fetching users by role:", error);
      throw error;
    }
  },

  // جلب التجار فقط
  async getMerchants(): Promise<User[]> {
    try {
      const usersCollection = collection(db, "users");
      const q = query(
        usersCollection,
        where("role", "in", ["merchant", "pending_merchant"]),
      );
      const usersSnapshot = await getDocs(q);
      const usersList = usersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          role: data.role || data.userType || "customer",
          status: data.status || "pending",
          stores: data.stores || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate(),
          avatar: data.avatar || "",
          city: data.city || "صنعاء",
          country: data.country || "اليمن",
          userType: data.userType || data.role || "customer",
        } as User;
      });

      return usersList;
    } catch (error) {
      console.error("Error fetching merchants:", error);
      // في حالة الخطأ، نعيد بيانات افتراضية للتجار
      return this.getMockMerchants();
    }
  },

  // جلب التاجر بواسطة ID
  async getMerchantById(id: string): Promise<User | null> {
    try {
      const userDoc = doc(db, "users", id);
      const userSnapshot = await getDoc(userDoc);

      if (userSnapshot.exists()) {
        const data = userSnapshot.data();
        return {
          id: userSnapshot.id,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          role: data.role || data.userType || "customer",
          status: data.status || "pending",
          stores: data.stores || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate(),
          avatar: data.avatar || "",
          city: data.city || "صنعاء",
          country: data.country || "اليمن",
          userType: data.userType || data.role || "customer",
        } as User;
      }
      return null;
    } catch (error) {
      console.error("Error fetching merchant:", error);
      return null;
    }
  },

  // تحديث بيانات المستخدم
  async updateUser(id: string, data: Partial<User>): Promise<void> {
    try {
      const userDoc = doc(db, "users", id);
      await updateDoc(userDoc, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  // حذف المستخدم
  async deleteUser(id: string): Promise<void> {
    try {
      const userDoc = doc(db, "users", id);
      await deleteDoc(userDoc);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  // تغيير حالة التاجر
  async updateMerchantStatus(
    id: string,
    status: User["status"],
    role?: User["role"],
  ): Promise<void> {
    try {
      const userDoc = doc(db, "users", id);
      const updateData: any = {
        status,
        updatedAt: Timestamp.now(),
      };

      if (role) {
        updateData.role = role;
      }

      await updateDoc(userDoc, updateData);
    } catch (error) {
      console.error("Error updating merchant status:", error);
      throw error;
    }
  },

  // بيانات تجار افتراضية للاستخدام في التطوير
  getMockMerchants(): User[] {
    return [
      {
        id: "1",
        firstName: "أحمد",
        lastName: "الحداد",
        email: "ahmed@example.com",
        phone: "+967711234567",
        role: "merchant",
        status: "active",
        stores: ["متجر الحداد", "الأثاث اليمني"],
        createdAt: new Date(2024, 0, 15),
        updatedAt: new Date(),
        lastLogin: new Date(),
        city: "صنعاء",
        country: "اليمن",
        userType: "merchant",
      },
      {
        id: "2",
        firstName: "فاطمة",
        lastName: "الشميري",
        email: "fatima@example.com",
        phone: "+967733456789",
        role: "pending_merchant",
        status: "pending",
        stores: ["متجر العطور اليمنية"],
        createdAt: new Date(2024, 1, 20),
        updatedAt: new Date(2024, 1, 25),
        lastLogin: new Date(2024, 1, 25),
        city: "عدن",
        country: "اليمن",
        userType: "merchant",
      },
      {
        id: "3",
        firstName: "محمد",
        lastName: "العتوب",
        email: "mohammed@example.com",
        phone: "+967755678901",
        role: "merchant",
        status: "suspended",
        stores: ["العتوب للملابس", "الأزياء اليمنية"],
        createdAt: new Date(2024, 0, 5),
        updatedAt: new Date(2024, 2, 10),
        lastLogin: new Date(2024, 2, 10),
        city: "تعز",
        country: "اليمن",
        userType: "merchant",
      },
      {
        id: "4",
        firstName: "خديجة",
        lastName: "السقاف",
        email: "khadija@example.com",
        phone: "+967777890123",
        role: "merchant",
        status: "active",
        stores: ["سقاف للتحف"],
        createdAt: new Date(2024, 2, 1),
        updatedAt: new Date(),
        lastLogin: new Date(),
        city: "صنعاء",
        country: "اليمن",
        userType: "merchant",
      },
    ];
  },
};
