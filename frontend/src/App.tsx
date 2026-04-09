import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute  from "@router/ProtectedRoute";
import PublicRoute     from "@router/PublicRoute";
import PageLoader      from "@components/common/PageLoader";
import DashboardLayout from "@components/layout/DashboardLayout";

// ── Public pages (NOT lazy — these are first paint) ──────────
import LandingPage  from "@pages/LandingPage";
import LoginPage    from "@pages/LoginPage";
import RegisterPage from "@pages/RegisterPage";

// ── Lazy-loaded dashboard pages ──────────────────────────────
const NotFoundPage          = lazy(() => import("@pages/NotFoundPage"));
const Overview              = lazy(() => import("@pages/Overview"));
const ProfilePage           = lazy(() => import("@pages/ProfilePage"));
const StudentLease          = lazy(() => import("@pages/student/StudentLease"));
const BrowseDevices         = lazy(() => import("@pages/student/BrowseDevices"));
const StudentPayments       = lazy(() => import("@pages/student/StudentPayments"));
const StudentTickets        = lazy(() => import("@pages/student/StudentTickets"));
const AdminApplications     = lazy(() => import("@pages/admin/AdminApplications"));
const AdminStudents         = lazy(() => import("@pages/admin/AdminStudents"));
const AdminStaff            = lazy(() => import("@pages/admin/StaffPage"));
const AdminLeases           = lazy(() => import("@pages/admin/AdminLeases"));
const AdminReports          = lazy(() => import("@pages/admin/AdminReports"));
const AdminSettings         = lazy(() => import("@pages/admin/AdminSettings"));
const InventoryDevices      = lazy(() => import("@pages/inventory/InventoryDevices"));
const InventoryMaintenance  = lazy(() => import("@pages/inventory/InventoryMaintenance"));
const InventoryAssign       = lazy(() => import("@pages/inventory/InventoryAssign"));
const FinanceBilling        = lazy(() => import("@pages/finance/FinanceBilling"));
const FinancePayments       = lazy(() => import("@pages/finance/FinancePayments"));
const FinanceInvoices       = lazy(() => import("@pages/finance/FinanceInvoices"));
const FinanceReports        = lazy(() => import("@pages/finance/FinanceReports"));

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<LandingPage />} />
        <Route element={<PublicRoute />}>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected dashboard */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard"       element={<Overview />} />
            <Route path="/profile"         element={<ProfilePage />} />

            {/* Student */}
            <Route path="/my-lease"        element={<StudentLease />} />
            <Route path="/browse-devices"  element={<BrowseDevices />} />
            <Route path="/my-payments"     element={<StudentPayments />} />
            <Route path="/my-tickets"      element={<StudentTickets />} />

            {/* Admin */}
            <Route path="/applications"    element={<AdminApplications />} />
            <Route path="/students"        element={<AdminStudents />} />
            <Route path="/staff"           element={<AdminStaff />} />
            <Route path="/leases"          element={<AdminLeases />} />
            <Route path="/admin-reports"   element={<AdminReports />} />
            <Route path="/settings"        element={<AdminSettings />} />

            {/* Inventory */}
            <Route path="/devices"         element={<InventoryDevices />} />
            <Route path="/maintenance"     element={<InventoryMaintenance />} />
            <Route path="/assign"          element={<InventoryAssign />} />

            {/* Finance */}
            <Route path="/billing"         element={<FinanceBilling />} />
            <Route path="/payments"        element={<FinancePayments />} />
            <Route path="/invoices"        element={<FinanceInvoices />} />
            <Route path="/finance-reports" element={<FinanceReports />} />
          </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*"    element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}