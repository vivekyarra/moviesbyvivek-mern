import { createContext, useContext, useEffect, useState } from "react";
import { clearSession, fetchMe, getStoredUser, getToken } from "../../services/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    fetchMe()
      .then((freshUser) => {
        setUser(freshUser);
        localStorage.setItem("auth_user", JSON.stringify(freshUser));
      })
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    clearSession();
    setUser(null);
  };

  const updateUser = (nextUser) => {
    if (nextUser) {
      localStorage.setItem("auth_user", JSON.stringify(nextUser));
    } else {
      localStorage.removeItem("auth_user");
    }
    setUser(nextUser);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, updateUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
