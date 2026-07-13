// src/context/AppContext.jsx

import { createContext, useContext, useEffect, useState } from "react";
import { getAllProducts } from "../services/productService";
import { 
  getCart, 
  addToCart as apiAddToCart, 
  updateCartItemQuantity as apiUpdateQuantity, 
  removeFromCart as apiRemoveFromCart, 
  clearCart as apiClearCart 
} from "../services/cartService";
import { 
  getWishlist, 
  addToWishlist as apiAddToWishlist, 
  removeFromWishlist as apiRemoveFromWishlist 
} from "../services/wishlistService";

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
  const [cart, setCart] = useState([]);

  // -----------------------------
  // Wishlist State
  // -----------------------------
  const [wishlist, setWishlist] = useState([]);

  // -----------------------------
  // Products State
  // -----------------------------
  const [products, setProducts] = useState([]);

  // Fetch products on load
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

  // Fetch Cart and Wishlist from backend when user logs in or page loads
  useEffect(() => {
    if (user) {
      const fetchCartAndWishlist = async () => {
        try {
          const cartData = await getCart();
          const items = cartData.cart?.cartItems?.map(item => ({
            ...item.product,
            quantity: item.quantity
          })).filter(item => item && item._id) || [];
          setCart(items);

          const wishlistData = await getWishlist();
          const wishlistItems = wishlistData.wishlist?.products || [];
          setWishlist(wishlistItems);
        } catch (err) {
          console.error("Error loading cart/wishlist from server:", err);
        }
      };
      fetchCartAndWishlist();
    } else {
      setCart([]);
      setWishlist([]);
    }
  }, [user]);

  // Save user profile state
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, [user]);

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

  const addToCart = async (product, quantity = 1) => {
    if (!user) return;
    try {
      const productId = product._id || product.id;
      await apiAddToCart(productId, quantity);

      setCart((prevCart) => {
        const existingItem = prevCart.find(
          (item) => item._id === productId
        );

        if (existingItem) {
          return prevCart.map((item) =>
            item._id === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }

        return [...prevCart, { ...product, quantity }];
      });
    } catch (err) {
      console.error("Failed to add item to database cart:", err);
      throw err;
    }
  };

  const removeFromCart = async (productId) => {
    if (!user) return;
    try {
      await apiRemoveFromCart(productId);
      setCart((prevCart) =>
        prevCart.filter((item) => item._id !== productId)
      );
    } catch (err) {
      console.error("Failed to remove item from database cart:", err);
      throw err;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!user) return;
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      await apiUpdateQuantity(productId, quantity);
      setCart((prevCart) =>
        prevCart.map((item) =>
          item._id === productId
            ? { ...item, quantity }
            : item
        )
      );
    } catch (err) {
      console.error("Failed to update cart item quantity in database:", err);
      throw err;
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      await apiClearCart();
      setCart([]);
    } catch (err) {
      console.error("Failed to clear database cart:", err);
      throw err;
    }
  };

  // Cart Total
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0
  );

  // Cart Count
  const cartCount = cart.reduce(
    (count, item) => count + (item.quantity || 1),
    0
  );

  // =============================
  // WISHLIST FUNCTIONS
  // =============================

  const addToWishlist = async (product) => {
    if (!user) return;
    const productId = product._id || product.id;
    const exists = wishlist.find(
      (item) => item._id === productId
    );

    if (!exists) {
      try {
        await apiAddToWishlist(productId);
        setWishlist([...wishlist, product]);
      } catch (err) {
        console.error("Failed to add item to database wishlist:", err);
      }
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user) return;
    try {
      await apiRemoveFromWishlist(productId);
      setWishlist(
        wishlist.filter((item) => item._id !== productId)
      );
    } catch (err) {
      console.error("Failed to remove item from database wishlist:", err);
    }
  };

  // =============================
  // CONTEXT VALUE
  // =============================

  const value = {
    // State
    user,
    cart,
    wishlist,
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
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};