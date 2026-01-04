import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { StoreProvider } from "@/lib/contexts/StoreContext";
import React, { useEffect, useState } from "react";

// Initialize platform with admin user
import { initializeApp } from "./lib/app-initialization";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";

// Protected Route Component
import ProtectedRoute from "./components/ProtectedRoute";

// Dashboard Pages
import StoreSelection from "./pages/customer/StoreSelection";
import StoreBuilder from "./pages/merchant/StoreBuilder";
import AddProduct from "./pages/merchant/AddProduct";
import StoreSettings from "./pages/merchant/StoreSettings";
import AdvancedStoreCustomization from "./pages/merchant/AdvancedStoreCustomization";

import CustomerDashboard from "./pages/customer/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminStoreApprovals from "@/pages/admin/AdminStoreApprovals";

// الصفحات الجديدة للمدير
import StoresManagement from "@/pages/admin/StoresManagement";
import MerchantsManagement from "@/pages/admin/MerchantsManagement";
import PlatformSettings from "@/pages/admin/PlatformSettings";

// Store Frontend
import WorkingStorefront from "./pages/store/WorkingStorefront";

// Placeholder pages
import PlaceholderPage from "./pages/PlaceholderPage";
import DiagnosticsPage from "./pages/DiagnosticsPage";

import CheckoutPage from "./pages/store/CheckoutPage";
import OrderConfirmation from "./pages/customer/OrderConfirmation";
import EmailVerification from "./pages/EmailVerification";
import CreateStore from "./pages/CreateStore";
import ApplicationStatus from "./pages/ApplicationStatus";
import WaitingEmailVerification from "./pages/WaitingEmailVerification";
import MerchantComprehensiveDashboard from "./pages/merchant/merchant-dashboard/MerchantDashboard";
import Profile from "./pages/customer/Profile";
import CustomerAuth from "./pages/customer/CustomerAuth";

const queryClient = new QueryClient();

const AppContent = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeApp();
        setInitialized(true);
      } catch (error) {
        console.error("Failed to initialize app:", error);
        setInitialized(true); // نستمر حتى لو فشل التهيئة
      }
    };
    init();
  }, []);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تهيئة التطبيق...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/customer/auth" element={<CustomerAuth />} />
              <Route path="/merchant-signup" element={<SignUp />} />
              <Route
                path="/waiting-email-verification"
                element={<WaitingEmailVerification />}
              />
              <Route
                path="/email-verification"
                element={<EmailVerification />}
              />

              {/* Admin Dashboard Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/store-approvals"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminStoreApprovals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/stores"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <StoresManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/merchants"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <MerchantsManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PlatformSettings />
                  </ProtectedRoute>
                }
              />

              {/* بقية صفحات المدير */}
              <Route
                path="/admin/customers"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PlaceholderPage type="admin-customers" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PlaceholderPage type="admin-analytics" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/payments"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PlaceholderPage type="admin-payments" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PlaceholderPage type="admin-reports" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/subscriptions"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PlaceholderPage type="admin-subscriptions" />
                  </ProtectedRoute>
                }
              />

              {/* Merchant Dashboard Routes */}
              <Route
                path="/merchant/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["merchant"]}>
                    <MerchantComprehensiveDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-store"
                element={
                  <ProtectedRoute allowedRoles={["merchant"]}>
                    <CreateStore />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/merchant/application-status"
                element={
                  <ProtectedRoute allowedRoles={["merchant"]}>
                    <ApplicationStatus />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/merchant/store-builder"
                element={
                  <ProtectedRoute allowedRoles={["merchant"]}>
                    <StoreBuilder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/merchant/advanced-customization"
                element={
                  <ProtectedRoute allowedRoles={["merchant"]}>
                    <AdvancedStoreCustomization />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/merchant/products/new"
                element={
                  <ProtectedRoute allowedRoles={["merchant"]}>
                    <AddProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/merchant/settings"
                element={
                  <ProtectedRoute allowedRoles={["merchant"]}>
                    <StoreSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/merchant/customers"
                element={
                  <ProtectedRoute allowedRoles={["merchant"]}>
                    <PlaceholderPage type="merchant-customers" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/merchant/analytics"
                element={
                  <ProtectedRoute allowedRoles={["merchant"]}>
                    <PlaceholderPage type="merchant-analytics" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/merchant/payments"
                element={
                  <ProtectedRoute allowedRoles={["merchant"]}>
                    <PlaceholderPage type="merchant-payments" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/merchant/shipping"
                element={
                  <ProtectedRoute allowedRoles={["merchant"]}>
                    <PlaceholderPage type="merchant-shipping" />
                  </ProtectedRoute>
                }
              />

              {/* Customer Dashboard Routes */}
              <Route
                path="/customer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/customer/stores" element={<StoreSelection />} />
              <Route path="/store-selection" element={<StoreSelection />} />
              <Route
                path="/customer/stores"
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <StoreSelection />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/orders"
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <PlaceholderPage type="customer-orders" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/store/:subdomain/checkout"
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/store/:subdomain/order-confirmation"
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <OrderConfirmation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/wishlist"
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <PlaceholderPage type="customer-wishlist" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/profile"
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/addresses"
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <PlaceholderPage type="customer-addresses" />
                  </ProtectedRoute>
                }
              />

              {/* Store Pages (Public store fronts) */}
              <Route path="/store/:subdomain" element={<WorkingStorefront />} />
              <Route
                path="/store-basic/:subdomain"
                element={<WorkingStorefront />}
              />

              {/* Static Pages */}
              <Route
                path="/features"
                element={<PlaceholderPage type="features" />}
              />
              <Route
                path="/pricing"
                element={<PlaceholderPage type="pricing" />}
              />
              <Route path="/about" element={<PlaceholderPage type="about" />} />
              <Route
                path="/contact"
                element={<PlaceholderPage type="contact" />}
              />
              <Route path="/help" element={<PlaceholderPage type="help" />} />
              <Route path="/docs" element={<PlaceholderPage type="docs" />} />
              <Route
                path="/privacy"
                element={<PlaceholderPage type="privacy" />}
              />
              <Route path="/terms" element={<PlaceholderPage type="terms" />} />
              <Route
                path="/careers"
                element={<PlaceholderPage type="careers" />}
              />

              {/* Auth Recovery */}
              <Route
                path="/forgot-password"
                element={<PlaceholderPage type="forgot-password" />}
              />
              <Route
                path="/reset-password"
                element={<PlaceholderPage type="reset-password" />}
              />

              {/* Marketplace Pages */}
              <Route
                path="/marketplace"
                element={<PlaceholderPage type="marketplace" />}
              />
              <Route
                path="/marketplace/search"
                element={<PlaceholderPage type="marketplace-search" />}
              />
              <Route
                path="/marketplace/categories"
                element={<PlaceholderPage type="marketplace-categories" />}
              />
              <Route
                path="/marketplace/deals"
                element={<PlaceholderPage type="marketplace-deals" />}
              />

              {/* Diagnostics Page */}
              <Route path="/diagnostics" element={<DiagnosticsPage />} />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppContent />
  </QueryClientProvider>
);

// Get the root element
const rootElement = document.getElementById("root")!;

// Create root only if it doesn't exist
let root = (rootElement as any)._reactRoot;
if (!root) {
  root = createRoot(rootElement);
  (rootElement as any)._reactRoot = root;
}

root.render(<App />);
