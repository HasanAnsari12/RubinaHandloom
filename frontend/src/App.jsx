import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import NotFound from "./pages/NotFound";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";

import AdminDashboard from "./pages/AdminDashboard";
import AddProduct from "./pages/AddProduct";
import AdminProducts from "./pages/AdminProducts";
import EditProduct from "./pages/EditProduct";
import AdminOrders from "./pages/AdminOrders";
import AdminUsers from "./pages/AdminUsers";
import CSVUpload from "./pages/CSVUpload";
import ForgotPassword from "./pages/ForgotPassword";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ResetPassword from "./pages/ResetPassword";
import Account from "./pages/Account";
import EditProfile from "./pages/EditProfile";
import AddressPage from "./pages/AddressPage";
import ChangePassword from "./pages/ChangePassword";
function AppContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {!hideNavbar && (
        <Navbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      )}

      <Routes>
        {/* Home */}
        <Route
          path="/"
          element={<Home searchTerm={searchTerm} />}
        />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Products */}
        <Route
          path="/products"
          element={<Products searchTerm={searchTerm} />}
        />
        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        {/* Cart & Orders */}
        <Route path="/cart" element={<Cart />} />
        <Route
  path="/checkout"
  element={<Checkout />}
/>
        <Route
          path="/order-success"
          element={<OrderSuccess />}
        />
        <Route path="/orders" element={<Orders />} />
        <Route path="/wishlist" element={<Wishlist />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/add-product"
          element={<AddProduct />}
        />

        <Route
          path="/admin/products"
          element={<AdminProducts />}
        />

        <Route
          path="/admin/edit-product/:id"
          element={<EditProduct />}
        />

        <Route
          path="/admin/orders"
          element={<AdminOrders />}
        />

        <Route
          path="/admin/users"
          element={<AdminUsers />}
        />

        <Route
          path="/admin/upload-csv"
          element={<CSVUpload />}
        />
        <Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>

<Route
  path="/reset-password"
  element={<ResetPassword />}
/>
<Route
  path="/account"
  element={<Account />}
/>
<Route
  path="/account/edit"
  element={<EditProfile />}
/>
<Route
  path="/account/address"
  element={<AddressPage />}
/>
<Route
  path="/account/password"
  element={<ChangePassword />}
/>
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
      />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;