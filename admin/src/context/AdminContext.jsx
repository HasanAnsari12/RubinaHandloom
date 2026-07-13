import { createContext, useState, useEffect } from "react";
import { loginAdmin, logoutAdmin, getCurrentAdmin, verifySession } from "../services/authService";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState(getCurrentAdmin());
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [loading, setLoading] = useState(true);

  // Validate session on page load
  useEffect(() => {
    const checkSession = async () => {
      const storedToken = localStorage.getItem("adminToken");
      if (storedToken) {
        try {
          const user = await verifySession();
          setCurrentAdmin(user);
          setToken(storedToken);
        } catch (error) {
          console.error("Session verification failed:", error.message);
          handleLogout();
        }
      } else {
        handleLogout();
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const data = await loginAdmin(email, password);
      setCurrentAdmin(data.user);
      setToken(data.token);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setCurrentAdmin(null);
    setToken(null);
  };

  return (
    <AdminContext.Provider
      value={{
        currentAdmin,
        token,
        loading,
        login: handleLogin,
        logout: handleLogout,
        isAuthenticated: !!token && !!currentAdmin,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
