import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("mm_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem("mm_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (name, mobileNumber, adminPassword) => {
    const payload = { name, mobileNumber };
    if (adminPassword) payload.adminPassword = adminPassword;
    const res = await api.post("/auth/login", payload);
    localStorage.setItem("mm_token", res.data.token);
    setUser({
      id: res.data.id,
      name: res.data.name,
      mobileNumber: res.data.mobileNumber,
      role: res.data.role,
      pointsBalance: res.data.pointsBalance,
    });
  };

  const logout = () => {
    localStorage.removeItem("mm_token");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
