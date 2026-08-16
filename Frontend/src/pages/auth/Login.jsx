import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Store, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { ROLE_HOME } from "../../constants/roles";

export default function Login() {
  const { login, isAuthenticated, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Already logged in -> skip the login screen entirely
  if (!authLoading && isAuthenticated) {
    const redirectTo = location.state?.from?.pathname || ROLE_HOME[role];
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Vui lòng nhập tên đăng nhập và mật khẩu");
      return;
    }

    setSubmitting(true);
    try {
      const loggedInUser = await login(username, password);
      const redirectTo =
        location.state?.from?.pathname || ROLE_HOME[loggedInUser.role];
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left branding panel */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-slate-900 p-10 text-white lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500">
            <Store size={22} />
          </div>
          <span className="text-lg font-bold tracking-wide">SH MART</span>
        </div>

        <div className="max-w-md">
          <h2 className="mb-3 text-3xl font-bold leading-tight">
            Quản lý cửa hàng
            <br />
            gọn gàng, hiệu quả.
          </h2>
          <p className="text-slate-400">
            Bán hàng, kho, hóa đơn, ca làm việc và báo cáo — tất cả trong một hệ
            thống duy nhất dành cho SH MART.
          </p>
        </div>

        <p className="text-xs text-slate-500">
          SH MART © {new Date().getFullYear()} — Hệ thống quản lý bán lẻ
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white">
              <Store size={22} />
            </div>
            <span className="text-lg font-bold tracking-wide text-slate-900">
              SH MART
            </span>
          </div>

          <h1 className="mb-1 text-2xl font-bold text-slate-900">Đăng nhập</h1>
          <p className="mb-6 text-sm text-slate-500">
            Nhập thông tin tài khoản để tiếp tục.
          </p>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoFocus
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 pr-10 text-sm outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
