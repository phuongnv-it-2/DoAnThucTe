import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../services/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load: if a token exists, validate it against /auth/me
  useEffect(() => {
    const token = localStorage.getItem("shmart_token");
    const cachedUser = localStorage.getItem("shmart_user");

    if (!token) {
      setLoading(false);
      return;
    }

    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch {
        // ignore parse errors, fall through to /me check
      }
    }

    authApi
      .me()
      .then((res) => {
        setUser(res.data.data);
        localStorage.setItem("shmart_user", JSON.stringify(res.data.data));
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

    localStorage.setItem("shmart_token", token);
    localStorage.setItem("shmart_user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    return loggedInUser;
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
