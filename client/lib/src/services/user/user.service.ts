import {
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  collection,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { UserData } from "../../types/user.types";

export const userService = {
  async getAllUsers(): Promise<UserData[]> {
    try {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          uid: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate(),
        } as UserData;
      });

      return usersList;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  async getUsersByRole(role: UserData["userType"]): Promise<UserData[]> {
    try {
      const usersCollection = collection(db, "users");
      const q = query(usersCollection, where("userType", "==", role));
      const usersSnapshot = await getDocs(q);
      const usersList = usersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          uid: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate(),
        } as UserData;
      });

      return usersList;
    } catch (error) {
      console.error("Error fetching users by role:", error);
      throw error;
    }
  },

  async getMerchants(): Promise<UserData[]> {
    try {
      const usersCollection = collection(db, "users");
      const q = query(
        usersCollection,
        where("userType", "in", ["merchant", "pending_merchant"]),
      );
      const usersSnapshot = await getDocs(q);
      const usersList = usersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          uid: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate(),
        } as UserData;
      });

      return usersList;
    } catch (error) {
      console.error("Error fetching merchants:", error);
      return this.getMockMerchants();
    }
  },

  async updateUser(uid: string, data: Partial<UserData>): Promise<void> {
    try {
      const userDoc = doc(db, "users", uid);
      await updateDoc(userDoc, {
        ...data,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  getMockMerchants(): UserData[] {
    return [
      {
        uid: "1",
        firstName: "أحمد",
        lastName: "الحداد",
        email: "ahmed@example.com",
        phone: "+967711234567",
        userType: "merchant",
        role: "merchant",
        status: "active",
        stores: ["متجر الحداد", "الأثاث اليمني"],
        createdAt: new Date(2024, 0, 15),
        updatedAt: new Date(),
        lastLogin: new Date(),
        city: "صنعاء",
        country: "اليمن",
        isActive: true,
      },
    ];
  },
};

export default userService;
