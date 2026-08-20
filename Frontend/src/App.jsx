import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import MainLayout from "./layouts/MainLayout";

import Login from "./pages/auth/Login";
import Dashboard from "./pages/shared/Dashboard";
import POS from "./pages/pos/POS";
import ShiftManagement from "./pages/shift/ShiftManagement";
import ComingSoon from "./pages/ComingSoon";
import { ROLE_HOME } from "./constants/roles";

import CategoryManagement from "./pages/category/CategoryManagement";
import ProductManagement from "./pages/product/ProductManagement";
import InventoryManagement from "./pages/inventory/InventoryManagement";
import InvoiceManagement from "./pages/invoice/InvoiceManagement";
import PrintOrderManagement from "./pages/printOrder/PrintOrderManagement";
import Reports from "./pages/report/Reports";
import ActivityLogs from "./pages/activityLog/ActivityLogs";
import UserManagement from "./pages/user/UserManagement";

function RootRedirect() {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[role]} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<RootRedirect />} />

            {/* Everything below requires a valid session */}
            <Route element={<ProtectedRoute />}>
              {/* ---------------------------- ADMIN ---------------------------- */}
              <Route element={<RoleRoute allow={["ADMIN"]} />}>
                <Route path="/admin" element={<MainLayout />}>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="pos" element={<POS />} />
                  <Route path="products" element={<ProductManagement />} />
                  <Route path="categories" element={<CategoryManagement />} />
                  <Route path="inventory" element={<InventoryManagement />} />
                  <Route
                    path="employees"
                    element={<ComingSoon title="Nhân viên" />}
                  />
                  <Route path="shifts" element={<ShiftManagement />} />
                  <Route path="invoices" element={<InvoiceManagement />} />
                  <Route
                    path="print-orders"
                    element={<PrintOrderManagement />}
                  />
                  <Route path="reports" element={<Reports />} />
                  <Route path="activity-logs" element={<ActivityLogs />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route
                    path="settings"
                    element={<ComingSoon title="Cài đặt" />}
                  />
                </Route>
              </Route>

              {/* --------------------------- MANAGER --------------------------- */}
              <Route element={<RoleRoute allow={["MANAGER"]} />}>
                <Route path="/manager" element={<MainLayout />}>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="pos" element={<POS />} />
                  <Route path="products" element={<ProductManagement />} />
                  <Route path="inventory" element={<InventoryManagement />} />
                  <Route
                    path="employees"
                    element={<ComingSoon title="Nhân viên" />}
                  />
                  <Route path="shifts" element={<ShiftManagement />} />
                  <Route path="invoices" element={<InvoiceManagement />} />
                  <Route
                    path="print-orders"
                    element={<PrintOrderManagement />}
                  />
                  <Route path="reports" element={<Reports />} />
                </Route>
              </Route>

              {/* ---------------------------- STAFF ----------------------------- */}
              <Route element={<RoleRoute allow={["STAFF"]} />}>
                <Route path="/staff" element={<MainLayout />}>
                  <Route path="pos" element={<POS />} />
                  <Route
                    path="products"
                    element={<ComingSoon title="Sản phẩm" />}
                  />
                  <Route path="invoices" element={<InvoiceManagement />} />
                  <Route
                    path="print-orders"
                    element={<PrintOrderManagement />}
                  />
                  <Route path="shift" element={<ShiftManagement />} />
                </Route>
              </Route>

              {/* --------------------------- SHARED ------------------------------ */}
              <Route
                element={<RoleRoute allow={["ADMIN", "MANAGER", "STAFF"]} />}
              >
                <Route element={<MainLayout />}>
                  <Route
                    path="/profile"
                    element={<ComingSoon title="Tài khoản của tôi" />}
                  />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
