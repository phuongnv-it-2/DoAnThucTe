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

/** Redirects "/" to the correct home page based on the logged-in role. */
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
                  <Route
                    path="products"
                    element={<ComingSoon title="Sản phẩm" />}
                  />
                  <Route path="categories" element={<CategoryManagement />} />
                  <Route
                    path="inventory"
                    element={<ComingSoon title="Kho hàng" />}
                  />
                  <Route
                    path="employees"
                    element={<ComingSoon title="Nhân viên" />}
                  />
                  <Route path="shifts" element={<ShiftManagement />} />
                  <Route
                    path="invoices"
                    element={<ComingSoon title="Hóa đơn" />}
                  />
                  <Route
                    path="print-orders"
                    element={<ComingSoon title="Đơn in" />}
                  />
                  <Route
                    path="reports"
                    element={<ComingSoon title="Báo cáo" />}
                  />
                  <Route
                    path="activity-logs"
                    element={<ComingSoon title="Lịch sử hoạt động" />}
                  />
                  <Route
                    path="users"
                    element={<ComingSoon title="Tài khoản" />}
                  />
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
                  <Route
                    path="products"
                    element={<ComingSoon title="Sản phẩm" />}
                  />
                  <Route
                    path="inventory"
                    element={<ComingSoon title="Kho" />}
                  />
                  <Route
                    path="employees"
                    element={<ComingSoon title="Nhân viên" />}
                  />
                  <Route path="shifts" element={<ShiftManagement />} />
                  <Route
                    path="invoices"
                    element={<ComingSoon title="Hóa đơn" />}
                  />
                  <Route
                    path="print-orders"
                    element={<ComingSoon title="Đơn in" />}
                  />
                  <Route
                    path="reports"
                    element={<ComingSoon title="Báo cáo" />}
                  />
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
                  <Route
                    path="invoices"
                    element={<ComingSoon title="Hóa đơn" />}
                  />
                  <Route
                    path="print-orders"
                    element={<ComingSoon title="Đơn in" />}
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
