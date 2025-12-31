# 🏪 Merchant Dashboard Examples

Complete examples of how merchant dashboard components should be implemented to ensure per-store data isolation.

---

## ✅ **CustomersTab.tsx** - Show Only Store's Customers

### Problem Solved
Customers from ALL stores were showing in the dashboard.

### Correct Implementation

```typescript
// client/pages/merchant/merchant-dashboard/CustomersTab.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getStoreCustomers } from "@/lib/multi-tenant";
import type { StoreCustomer } from "@/lib/types-multi-tenant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function CustomersTab() {
  const { storeId } = useParams<{ storeId: string }>();
  const [customers, setCustomers] = useState<StoreCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCustomers() {
      if (!storeId) {
        setError("Store ID not found");
        return;
      }

      try {
        // ✅ CRITICAL: Only fetch customers for THIS store
        const storeCustomers = await getStoreCustomers(storeId);
        
        // ✅ Verify all customers belong to this store
        const verified = storeCustomers.filter(c => c.storeId === storeId);
        
        setCustomers(verified);
        setError(null);
      } catch (err) {
        console.error("Failed to load customers:", err);
        setError("Failed to load customers");
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, [storeId]);

  if (loading) return <div>Loading customers...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">
        Customers ({customers.length})
      </h2>

      {customers.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500">No customers yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {customers.map((customer) => (
            <Card key={customer.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {customer.firstName} {customer.lastName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* ✅ Each customer shows storeId verification */}
                <p className="text-sm text-gray-600">Email: {customer.email}</p>
                <p className="text-sm text-gray-600">Phone: {customer.phone || "N/A"}</p>
                <p className="text-sm text-gray-600">
                  Store ID: <Badge>{customer.storeId}</Badge>
                </p>
                <p className="text-sm">
                  Orders: {customer.totalOrders || 0} | 
                  Spent: ${customer.totalSpent || 0}
                </p>
                <p className="text-xs text-gray-500">
                  Joined: {customer.createdAt?.toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ KEY POINTS ============
// 1. useParams extracts {storeId} from route /merchant/{storeId}
// 2. getStoreCustomers(storeId) ONLY fetches customers from this store
// 3. Verification check ensures all returned customers have matching storeId
// 4. Display shows storeId badge for transparency
// 5. No cross-store data leakage possible
```

---

## ✅ **OrdersTab.tsx** - Show Only Store's Orders

### Problem Solved
Orders from ALL stores were visible in the dashboard.

### Correct Implementation

```typescript
// client/pages/merchant/merchant-dashboard/OrdersTab.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getStoreOrders } from "@/lib/multi-tenant";
import { orderBy } from "firebase/firestore";
import type { Order } from "@/lib/types-multi-tenant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function OrdersTab() {
  const { storeId } = useParams<{ storeId: string }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "shipped" | "delivered">("all");

  useEffect(() => {
    async function loadOrders() {
      if (!storeId) {
        setError("Store ID not found");
        return;
      }

      try {
        // ✅ CRITICAL: Only fetch orders for THIS store
        let allOrders = await getStoreOrders(storeId, [
          orderBy("createdAt", "desc"),
        ]);

        // ✅ Optional: Apply local filter
        if (filter !== "all") {
          allOrders = allOrders.filter(o => o.orderStatus === filter);
        }

        // ✅ Verify all orders belong to this store
        const verified = allOrders.filter(o => o.storeId === storeId);

        setOrders(verified);
        setError(null);
      } catch (err) {
        console.error("Failed to load orders:", err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [storeId, filter]);

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const getStatusColor = (status: Order["orderStatus"]) => {
    const colors: Record<Order["orderStatus"], string> = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      returned: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Orders ({orders.length})</h2>
        
        {/* Filter by status */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-3 py-2 border rounded"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{order.id.slice(0, 8)}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Customer: {order.customerSnapshot.firstName} {order.customerSnapshot.lastName}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <Badge className={getStatusColor(order.orderStatus)}>
                      {order.orderStatus}
                    </Badge>
                    <Badge variant="outline">
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* ✅ Order details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total</p>
                    <p className="font-bold">${order.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Items</p>
                    <p className="font-bold">{order.items.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Method</p>
                    <p className="font-bold">{order.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-bold">
                      {order.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* ✅ Store ID verification (for debugging) */}
                <p className="text-xs text-gray-500">
                  Store: <Badge variant="secondary">{order.storeId}</Badge>
                </p>

                {/* Order items preview */}
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Items:</p>
                  {order.items.slice(0, 3).map((item, idx) => (
                    <p key={idx} className="text-sm text-gray-600">
                      • {item.name} x{item.quantity} @ ${item.price.toFixed(2)}
                    </p>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-sm text-gray-600">
                      ... and {order.items.length - 3} more
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-2">
                  <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                    View Details
                  </button>
                  {order.orderStatus !== "delivered" && (
                    <button className="px-3 py-1 text-sm border border-blue-500 text-blue-500 rounded hover:bg-blue-50">
                      Update Status
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ KEY POINTS ============
// 1. getStoreOrders(storeId) ONLY fetches orders from this store
// 2. Query constraints (orderBy, where) are scoped to store
// 3. Verification ensures all orders have matching storeId
// 4. Store ID badge shows for debugging/transparency
// 5. No cross-store data leakage possible
// 6. Performance: Efficient queries due to subcollection structure
```

---

## ✅ **ProductsTab.tsx** - Show Only Store's Products

### Correct Implementation

```typescript
// client/pages/merchant/merchant-dashboard/ProductsTab.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/lib/types-multi-tenant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProductsTab() {
  const { storeId } = useParams<{ storeId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      if (!storeId) return;

      try {
        // ✅ CRITICAL: Only fetch products from THIS store's subcollection
        const productsRef = collection(db, "stores", storeId, "products");
        const snap = await getDocs(productsRef);

        const productsData = snap.docs.map((doc) => ({
          id: doc.id,
          storeId,
          ...doc.data(),
        })) as Product[];

        // ✅ Verify all products have matching storeId
        const verified = productsData.filter(p => p.storeId === storeId);

        setProducts(verified);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [storeId]);

  if (loading) return <div>Loading products...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Products ({products.length})</h2>

      <div className="grid grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle className="text-lg">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-600">{product.description}</p>
              <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
              <p className="text-xs text-gray-500">
                Store: <span className="font-mono">{product.storeId}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============ KEY POINTS ============
// 1. Products fetched from /stores/{storeId}/products ONLY
// 2. No global products collection query (per-store isolation)
// 3. All products have matching storeId (verified)
// 4. Cannot accidentally see another store's products
```

---

## ✅ **Protected Route** - Verify Store Ownership

### Route Protection for Merchant Dashboard

```typescript
// client/App.tsx or routing.tsx
import { Navigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * ✅ Verify user owns the store before showing dashboard
 */
async function verifyStoreOwnership(
  storeId: string,
  userId: string
): Promise<boolean> {
  try {
    const storeRef = doc(db, "stores", storeId);
    const storeSnap = await getDoc(storeRef);

    if (!storeSnap.exists()) {
      return false;
    }

    const storeData = storeSnap.data();
    return storeData.ownerId === userId; // Only owner can access
  } catch (err) {
    console.error("Store ownership check failed:", err);
    return false;
  }
}

/**
 * ✅ Protected merchant dashboard route
 */
export function MerchantDashboardWrapper() {
  const { storeId } = useParams<{ storeId: string }>();
  const [isOwner, setIsOwner] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkOwnership() {
      const user = auth.currentUser;
      if (!user || !storeId) {
        setIsOwner(false);
        return;
      }

      const owns = await verifyStoreOwnership(storeId, user.uid);
      setIsOwner(owns);
    }

    checkOwnership();
  }, [storeId]);

  if (isOwner === null) return <div>Checking access...</div>;
  if (!isOwner) return <Navigate to="/" replace />;

  return <MerchantDashboard />;
}
```

---

## 🧪 Verification Checklist

- [ ] All queries in CustomersTab use `getStoreCustomers(storeId)`
- [ ] All queries in OrdersTab use `getStoreOrders(storeId)`
- [ ] All queries in ProductsTab use store subcollection
- [ ] Merchant can ONLY see data from their own store
- [ ] Switching between stores refreshes data correctly
- [ ] Store ID is verified in each component
- [ ] No root-level collection queries for orders/customers
- [ ] Route protection verifies store ownership before showing dashboard
- [ ] Trying to access another merchant's storeId shows 404 or redirect

