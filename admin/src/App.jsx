import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AdminProvider } from "./context/AdminContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ManageProducts from "./pages/Products/ManageProducts";
import AddProduct from "./pages/Products/AddProduct";
import EditProduct from "./pages/Products/EditProduct";
import ManageOrders from "./pages/Orders/ManageOrders";
import ManageUsers from "./pages/Users/ManageUsers";
import ManageCategories from "./pages/Categories/ManageCategories";
import ManageCoupons from "./pages/Coupons/ManageCoupons";
import ManageReviews from "./pages/Reviews/ManageReviews";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports/Reports";
import Inventory from "./pages/Inventory/Inventory";
import Settings from "./pages/Settings/Settings";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AdminProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ManageProducts />} />
              <Route path="products/add" element={<AddProduct />} />
              <Route path="products/edit/:id" element={<EditProduct />} />
              <Route path="orders" element={<ManageOrders />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="categories" element={<ManageCategories />} />
              <Route path="coupons" element={<ManageCoupons />} />
              <Route path="reviews" element={<ManageReviews />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="reports" element={<Reports />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
      </Router>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </AdminProvider>
  );
}

export default App;
