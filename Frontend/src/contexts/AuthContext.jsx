import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../services/authApi";

const AuthContext = createContext(null);

// Chuẩn hóa role về dạng string (tên role), bất kể backend trả string hay object lồng nhau
function normalizeUser(rawUser) {
  if (!rawUser) return rawUser;
  const roleName =
    typeof rawUser.role === "string" ? rawUser.role : rawUser.role?.name;
  return { ...rawUser, role: roleName };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("shmart_token");
    const cachedUser = localStorage.getItem("shmart_user");

    if (!token) {
      setLoading(false);
      return;
    }

    if (cachedUser) {
      try {
        setUser(normalizeUser(JSON.parse(cachedUser)));
      } catch {
        // ignore parse errors, fall through to /me check
      }
    }

    authApi
      .me()
      .then((res) => {
        const normalized = normalizeUser(res.data.data);
        setUser(normalized);
        localStorage.setItem("shmart_user", JSON.stringify(normalized));
      })
      .catch(() => {
        localStorage.removeItem("shmart_token");
        localStorage.removeItem("shmart_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    const res = await authApi.login(username, password);
    const { token, user: loggedInUser } = res.data.data;

    const normalized = normalizeUser(loggedInUser);
    localStorage.setItem("shmart_token", token);
    localStorage.setItem("shmart_user", JSON.stringify(normalized));
    setUser(normalized);

    return normalized;
  }

  function logout() {
    localStorage.removeItem("shmart_token");
    localStorage.removeItem("shmart_user");
    setUser(null);
  }

  const value = {
    user,
    role: user?.role,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
