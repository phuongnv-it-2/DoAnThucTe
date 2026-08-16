import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ROLE_HOME } from "../constants/roles";

/**
 * Usage: <Route element={<RoleRoute allow={["ADMIN", "MANAGER"]} />}>
 * Must be nested INSIDE <ProtectedRoute /> so `user` is guaranteed to exist.
 * If the current user's role isn't in `allow`, redirect them to their own
 * home page instead of the URL they typed - this is what stops a STAFF
 * account from reaching /admin/* by editing the address bar.
 */
export default function RoleRoute({ allow = [] }) {
  const { role } = useAuth();

  if (!allow.includes(role)) {
    const fallback = ROLE_HOME[role] || "/login";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
