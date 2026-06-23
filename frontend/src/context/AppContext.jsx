// src/context/AppContext.jsx

import { createContext, useContext, useEffect, useState } from "react";
import { getAllProducts } from "../services/productService";

// Context Create
const AppContext = createContext();

// Custom Hook
export const useAppContext = () => {
  return useContext(AppContext);
};

// Provider Component
export const AppProvider = ({ children }) => {
  // -----------------------------
  // User State
  // -----------------------------
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || null;
  });

  // -----------------------------
  // Cart State
  // -----------------------------
  const [cart, setCart] = useState(() => {
    return JSON.parse(localStorage.getItem("cart")) || [];
  });

  // -----------------------------
  // Wishlist State
  // -----------------------------
  const [wishlist, setWishlist] = useState(() => {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
  });

  // -----------------------------
  // Orders State
  // -----------------------------
  const [orders, setOrders] = useState(() => {
    return JSON.parse(localStorage.getItem("orders")) || [];
  });

  // -----------------------------
  // Products State
  // -----------------------------
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data.products || []);
      } catch (err) {
        console.error("Failed to fetch products in AppContext:", err);
      }
    };
    fetchProductsData();
  }, []);

  // -----------------------------
  // Save to LocalStorage
  // -----------------------------
  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  // =============================
  // AUTH FUNCTIONS
  // =============================

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  // =============================
  // CART FUNCTIONS
  // =============================

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.id !== productId)
    );
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Cart Total
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Cart Count
  const cartCount = cart.reduce(
    (count, item) => count + item.quantity,
    0
  );

  // =============================
  // WISHLIST FUNCTIONS
  // =============================

  const addToWishlist = (product) => {
    const exists = wishlist.find(
      (item) => item.id === product.id
    );

    if (!exists) {
      setWishlist([...wishlist, product]);
    }
  };

  const removeFromWishlist = (productId) => {
    setWishlist(
      wishlist.filter((item) => item.id !== productId)
    );
  };

  // =============================
  // ORDER FUNCTIONS
  // =============================

  const placeOrder = () => {
    if (cart.length === 0) return;

    const newOrder = {
      id: Date.now(),
      items: cart,
      total: cartTotal,
      date: new Date().toLocaleString(),
      status: "Placed",
    };

    setOrders([newOrder, ...orders]);
    clearCart();
  };

  // =============================
  // CONTEXT VALUE
  // =============================

  const value = {
    // State
    user,
    cart,
    wishlist,
    orders,
    products,
    setProducts,

    // Auth
    login,
    logout,

    // Cart
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,

    // Wishlist
    addToWishlist,
    removeFromWishlist,

    // Orders
    placeOrder,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};