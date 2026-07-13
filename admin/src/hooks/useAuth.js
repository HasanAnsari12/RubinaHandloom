import { useContext } from "react";
import { AdminContext } from "../context/AdminContext";

export const useAuth = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAuth must be used within an AdminProvider");
  }
  return context;
};
