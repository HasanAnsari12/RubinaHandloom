// frontend/src/pages/Checkout.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppContext } from "../context/AppContext";
import { placeOrder as apiPlaceOrder } from "../services/orderService";
import {
  calculateCheckoutPricing,
  createPaymentOrder,
  verifyPayment,
} from "../services/paymentService";
import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const { cart, user, clearCart } = useAppContext();

  // Address state
  const [addresses] = useState(() => {
    return JSON.parse(localStorage.getItem("addresses")) || [];
  });
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [isChangingAddress, setIsChangingAddress] = useState(false);

  // Payment state
  const [selectedMethod, setSelectedMethod] = useState("upi"); // "upi" | "card" | "cod" | "emi" | "gift_card"
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("idle"); // "idle" | "processing" | "cancelled" | "failed" | "success"
  const [statusMessage, setStatusMessage] = useState("");

  // Backend authoritative pricing state
  const [pricing, setPricing] = useState({
    mrpSubtotal: 0,
    sellingSubtotal: 0,
    productDiscount: 0,
    couponDiscount: 0,
    shippingCharge: 0,
    totalAmount: 0,
  });
  const [isPricingLoading, setIsPricingLoading] = useState(true);

  // Coupon state
  const [couponCode] = useState("");

  // Fetch backend-authoritative pricing on mount & cart update
  useEffect(() => {
    if (cart.length === 0) return;

    let isMounted = true;
    const fetchPricing = async () => {
      try {
        setIsPricingLoading(true);
        const res = await calculateCheckoutPricing(couponCode);
        if (isMounted && res.success && res.pricing) {
          setPricing(res.pricing);
        }
      } catch {
        // Fallback to client-side estimate if offline/network issue
        if (isMounted) {
          const clientSelling = cart.reduce(
            (sum, item) => sum + (item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price) * (item.quantity || 1),
            0
          );
          const clientMrp = cart.reduce(
            (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
            0
          );
          const clientShipping = 0;
          setPricing({
            mrpSubtotal: clientMrp,
            sellingSubtotal: clientSelling,
            productDiscount: Math.max(0, clientMrp - clientSelling),
            couponDiscount: 0,
            shippingCharge: clientShipping,
            totalAmount: clientSelling + clientShipping,
          });
        }
      } finally {
        if (isMounted) setIsPricingLoading(false);
      }
    };

    fetchPricing();
    return () => {
      isMounted = false;
    };
  }, [cart, couponCode]);

  const selectedAddress = addresses[selectedAddressIndex] || null;

  // Format delivery address for backend
  const getDeliveryAddressPayload = () => {
    if (!selectedAddress) return null;
    return {
      fullName: selectedAddress.fullName || selectedAddress.name || user?.name || "Customer",
      phone: selectedAddress.phone || "0000000000",
      house: selectedAddress.house || selectedAddress.flat || selectedAddress.addressLine1 || "House",
      area: selectedAddress.area || selectedAddress.street || selectedAddress.addressLine2 || "Area",
      city: selectedAddress.city || "City",
      state: selectedAddress.state || "State",
      pincode: selectedAddress.pincode || selectedAddress.zipCode || "000000",
    };
  };

  // 1. Handle Cash on Delivery (COD) Checkout Flow
  const handleCODOrder = async () => {
    const addressPayload = getDeliveryAddressPayload();
    if (!addressPayload) {
      toast.error("Please add or select a delivery address.");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    try {
      setIsProcessing(true);
      setPaymentStatus("processing");
      setStatusMessage("Reserving stock and creating COD order...");

      const orderData = {
        shippingAddress: addressPayload,
        paymentMethod: "COD",
        couponCode: couponCode || undefined,
      };

      const response = await apiPlaceOrder(orderData);
      if (response.success) {
        await clearCart();
        setPaymentStatus("success");
        toast.success("Order placed successfully! Cash on Delivery confirmed. 🎉");
        navigate("/order-success", {
          state: { orderId: response.order._id || response.order.id },
        });
      } else {
        throw new Error(response.message || "Failed to place COD order");
      }
    } catch (err) {
      console.error("COD checkout error:", err);
      setPaymentStatus("failed");
      const msg = err.response?.data?.message || err.message || "Could not place COD order.";
      setStatusMessage(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Handle Online Razorpay Checkout Flow (UPI / Card)
  const handleOnlinePayment = async () => {
    const addressPayload = getDeliveryAddressPayload();
    if (!addressPayload) {
      toast.error("Please add or select a delivery address.");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (!window.Razorpay) {
      toast.error("Payment SDK is loading. Please check your internet connection and retry.");
      return;
    }

    try {
      setIsProcessing(true);
      setPaymentStatus("processing");
      setStatusMessage("Initializing secure payment session with Razorpay...");

      // Step A: Request server-side order creation with verified database pricing
      const orderInitRes = await createPaymentOrder(couponCode);
      if (!orderInitRes.success) {
        throw new Error(orderInitRes.message || "Failed to initialize payment gateway order");
      }

      const { razorpayOrderId, amount, currency, keyId } = orderInitRes;

      // Step B: Configure official Razorpay Checkout modal
      const options = {
        key: keyId || "rzp_test_placeholder",
        amount: amount,
        currency: currency || "INR",
        name: "SRK Handloom",
        description: "Authentic Handloom Sarees",
        image: "/favicon.svg",
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            setStatusMessage("Verifying cryptographic payment signature...");
            setIsProcessing(true);

            // Step C: Server-side cryptographic HMAC-SHA256 verification and atomic inventory reservation
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              shippingAddress: addressPayload,
              couponCode: couponCode || undefined,
            });

            if (verifyRes.success) {
              await clearCart();
              setPaymentStatus("success");
              toast.success("Payment verified! Your order has been placed. 🎉");
              navigate("/order-success", {
                state: { orderId: verifyRes.order._id || verifyRes.order.id },
              });
            } else {
              throw new Error(verifyRes.message || "Payment signature verification failed");
            }
          } catch (verificationError) {
            console.error("Signature verification error:", verificationError);
            setPaymentStatus("failed");
            const errText =
              verificationError.response?.data?.message ||
              verificationError.message ||
              "Payment verification failed.";
            setStatusMessage(errText);
            toast.error(errText);
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: addressPayload.fullName,
          contact: addressPayload.phone,
          email: user?.email || "",
        },
        theme: {
          color: "#8B4513", // SRK Handloom Luxury Warm Saddle Brown
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setPaymentStatus("cancelled");
            setStatusMessage("Payment session was cancelled. No charges were made.");
            toast.info("Payment cancelled. You can change your method or try again.");
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", function (response) {
        setIsProcessing(false);
        setPaymentStatus("failed");
        const failureReason = response.error?.description || "Transaction declined by bank.";
        setStatusMessage(`Payment failed: ${failureReason}`);
        toast.error(`Payment failed: ${failureReason}`);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error("Payment initiation error:", err);
      setIsProcessing(false);
      setPaymentStatus("failed");
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to initialize payment gateway.";
      setStatusMessage(errorMsg);
      toast.error(errorMsg);
    }
  };

  // Empty cart fallback
  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <header className="checkout-header">
          <div className="checkout-header-content">
            <h1 className="checkout-title">Secure Checkout</h1>
            <p className="checkout-subtitle">Your cart is currently empty.</p>
          </div>
        </header>
        <div className="checkout-empty-container">
          <p>No sarees selected for checkout.</p>
          <Link to="/products" className="checkout-primary-btn">
            Explore Handloom Sarees
          </Link>
        </div>
      </div>
    );
  }

  const totalSavings = pricing.productDiscount + pricing.couponDiscount;

  return (
    <div className="checkout-page">
      {/* 1. Header Bar */}
      <header className="checkout-header">
        <div className="checkout-header-content">
          <h1 className="checkout-title">Secure Checkout</h1>
          <p className="checkout-subtitle">
            Authentic Handloom Sarees • 256-Bit Encrypted Payments
          </p>
        </div>
      </header>

      {/* 2. Trust Bar */}
      <div className="checkout-trust-bar">
        <div className="trust-item">
          <span className="trust-icon">🔒</span> Bank-Grade Encryption
        </div>
        <div className="trust-item">
          <span className="trust-icon">🚚</span> Insured Doorstep Delivery
        </div>
        <div className="trust-item">
          <span className="trust-icon">🧵</span> 100% Authentic Handloom
        </div>
      </div>

      <div className="checkout-layout-wrapper">
        {/* 3. Delivery Address Bar / Selector */}
        <section className="checkout-address-section">
          <div className="address-bar-header">
            <div className="address-bar-info">
              <span className="address-step-tag">1. Delivery Address</span>
              {selectedAddress ? (
                <div className="selected-address-summary">
                  <span className="address-name">{selectedAddress.fullName || user?.name}</span>
                  <span className="address-phone">• {selectedAddress.phone}</span>
                  <p className="address-compact-text">
                    {selectedAddress.house}, {selectedAddress.area}, {selectedAddress.city},{" "}
                    {selectedAddress.state} - {selectedAddress.pincode}
                  </p>
                </div>
              ) : (
                <span className="address-missing-alert">
                  No address selected. Please add a shipping address.
                </span>
              )}
            </div>

            <div className="address-bar-actions">
              {addresses.length > 0 && (
                <button
                  type="button"
                  className="address-toggle-btn"
                  onClick={() => setIsChangingAddress(!isChangingAddress)}
                >
                  {isChangingAddress ? "Done" : "Change Address"}
                </button>
              )}
              <button
                type="button"
                className="address-add-btn"
                onClick={() => navigate("/account/address")}
              >
                + Add New
              </button>
            </div>
          </div>

          {/* Collapsible Address Chooser */}
          {isChangingAddress && addresses.length > 0 && (
            <div className="address-drawer-grid">
              {addresses.map((addr, idx) => (
                <div
                  key={idx}
                  className={`address-option-card ${
                    selectedAddressIndex === idx ? "active-address-card" : ""
                  }`}
                  onClick={() => {
                    setSelectedAddressIndex(idx);
                    setIsChangingAddress(false);
                  }}
                >
                  <div className="address-radio-row">
                    <span className="custom-radio"></span>
                    <strong>{addr.fullName || "Address #" + (idx + 1)}</strong>
                  </div>
                  <p className="address-option-text">
                    {addr.phone} <br />
                    {addr.house}, {addr.area}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. Three-Panel Checkout System */}
        <div className="checkout-three-panels">
          {/* PANEL 1: LEFT PANEL — Payment Method Selector */}
          <aside className="panel-left-methods">
            <div className="panel-heading">
              <span className="step-badge">2</span>
              <h2>Payment Options</h2>
            </div>

            <nav className="payment-method-list" aria-label="Payment Methods">
              {/* Option A: UPI */}
              <button
                type="button"
                className={`payment-nav-item ${selectedMethod === "upi" ? "active-method" : ""}`}
                onClick={() => {
                  setSelectedMethod("upi");
                  setPaymentStatus("idle");
                }}
              >
                <div className="nav-item-header">
                  <span className="method-radio"></span>
                  <span className="method-name">UPI</span>
                  <span className="method-badge-fast">Fast</span>
                </div>
                <p className="method-caption">Google Pay, PhonePe, Paytm, BHIM</p>
              </button>

              {/* Option B: Credit / Debit Card */}
              <button
                type="button"
                className={`payment-nav-item ${selectedMethod === "card" ? "active-method" : ""}`}
                onClick={() => {
                  setSelectedMethod("card");
                  setPaymentStatus("idle");
                }}
              >
                <div className="nav-item-header">
                  <span className="method-radio"></span>
                  <span className="method-name">Credit / Debit Card</span>
                </div>
                <p className="method-caption">Visa, MasterCard, RuPay, Maestro</p>
              </button>

              {/* Option C: Cash on Delivery */}
              <button
                type="button"
                className={`payment-nav-item ${selectedMethod === "cod" ? "active-method" : ""}`}
                onClick={() => {
                  setSelectedMethod("cod");
                  setPaymentStatus("idle");
                }}
              >
                <div className="nav-item-header">
                  <span className="method-radio"></span>
                  <span className="method-name">Cash on Delivery</span>
                </div>
                <p className="method-caption">Pay cash upon saree delivery</p>
              </button>

              {/* Option D: EMI (Honest support indicator) */}
              <button
                type="button"
                className={`payment-nav-item disabled-nav-item ${
                  selectedMethod === "emi" ? "active-method" : ""
                }`}
                onClick={() => {
                  setSelectedMethod("emi");
                  setPaymentStatus("idle");
                }}
              >
                <div className="nav-item-header">
                  <span className="method-radio"></span>
                  <span className="method-name">EMI (Installments)</span>
                  <span className="method-badge-unavailable">Unavailable</span>
                </div>
                <p className="method-caption">Not enabled for this merchant</p>
              </button>

              {/* Option E: Gift Card (Honest support indicator) */}
              <button
                type="button"
                className={`payment-nav-item disabled-nav-item ${
                  selectedMethod === "gift_card" ? "active-method" : ""
                }`}
                onClick={() => {
                  setSelectedMethod("gift_card");
                  setPaymentStatus("idle");
                }}
              >
                <div className="nav-item-header">
                  <span className="method-radio"></span>
                  <span className="method-name">Gift Card</span>
                  <span className="method-badge-unavailable">Unavailable</span>
                </div>
                <p className="method-caption">Gift cards not supported yet</p>
              </button>
            </nav>
          </aside>

          {/* PANEL 2: CENTER PANEL — Dynamic Payment Content */}
          <main className="panel-center-content">
            {/* Status alerts */}
            {paymentStatus === "processing" && (
              <div className="payment-alert alert-processing">
                <span className="spinner-dot"></span>
                <span>{statusMessage || "Processing payment securely..."}</span>
              </div>
            )}

            {paymentStatus === "cancelled" && (
              <div className="payment-alert alert-cancelled">
                <span>⚠️ {statusMessage || "Payment was cancelled. You may retry."}</span>
              </div>
            )}

            {paymentStatus === "failed" && (
              <div className="payment-alert alert-failed">
                <span>❌ {statusMessage || "Transaction could not be completed. Please try again."}</span>
              </div>
            )}

            {/* DYNAMIC CONTENT VIEW 1: UPI */}
            {selectedMethod === "upi" && (
              <div className="dynamic-payment-pane">
                <div className="pane-header">
                  <h3 className="pane-title">Pay via UPI</h3>
                  <span className="gateway-trust-tag">Powered by Razorpay</span>
                </div>

                <p className="pane-description">
                  Pay instantly using your preferred UPI app. Safe, fast, and verified in real-time.
                </p>

                <div className="supported-apps-row">
                  <span className="app-pill">Google Pay</span>
                  <span className="app-pill">PhonePe</span>
                  <span className="app-pill">Paytm</span>
                  <span className="app-pill">BHIM UPI</span>
                  <span className="app-pill">CRED</span>
                </div>

                <div className="security-notice-box">
                  <span className="lock-icon">🔒</span>
                  <div>
                    <strong>100% Secure Checkout</strong>
                    <p>
                      When you click &ldquo;Proceed to Pay&rdquo;, the Razorpay secure payment interface will
                      open. You can enter your UPI ID or approve the payment request on your phone.
                    </p>
                  </div>
                </div>

                <div className="pane-action-bar">
                  <button
                    type="button"
                    className="pane-primary-btn"
                    onClick={() => handleOnlinePayment("upi")}
                    disabled={isProcessing || isPricingLoading}
                  >
                    {isProcessing ? (
                      "Opening Secure Gateway..."
                    ) : (
                      <>Proceed to Pay ₹{pricing.totalAmount.toLocaleString("en-IN")} via UPI</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* DYNAMIC CONTENT VIEW 2: CREDIT / DEBIT CARD */}
            {selectedMethod === "card" && (
              <div className="dynamic-payment-pane">
                <div className="pane-header">
                  <h3 className="pane-title">Credit or Debit Card</h3>
                  <span className="gateway-trust-tag">256-Bit Bank Encryption</span>
                </div>

                <p className="pane-description">
                  All major Indian and international cards accepted. We strictly follow RBI and
                  PCI-DSS security standards.
                </p>

                <div className="supported-apps-row">
                  <span className="app-pill">Visa</span>
                  <span className="app-pill">MasterCard</span>
                  <span className="app-pill">RuPay</span>
                  <span className="app-pill">Maestro</span>
                  <span className="app-pill">Diners Club</span>
                </div>

                <div className="security-notice-box">
                  <span className="lock-icon">🛡️</span>
                  <div>
                    <strong>Zero Raw Card Storage</strong>
                    <p>
                      SRK Handloom never collects, views, or stores your card number, expiry, or CVV.
                      All transactions are tokenized and processed via Razorpay&rsquo;s certified PCI-DSS Level 1 gateway.
                    </p>
                  </div>
                </div>

                <div className="pane-action-bar">
                  <button
                    type="button"
                    className="pane-primary-btn"
                    onClick={() => handleOnlinePayment("card")}
                    disabled={isProcessing || isPricingLoading}
                  >
                    {isProcessing ? (
                      "Opening Secure Gateway..."
                    ) : (
                      <>Proceed to Pay ₹{pricing.totalAmount.toLocaleString("en-IN")} via Card</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* DYNAMIC CONTENT VIEW 3: CASH ON DELIVERY */}
            {selectedMethod === "cod" && (
              <div className="dynamic-payment-pane">
                <div className="pane-header">
                  <h3 className="pane-title">Cash on Delivery</h3>
                  <span className="gateway-trust-tag cod-trust-tag">Doorstep Payment</span>
                </div>

                <p className="pane-description">
                  Pay in cash to the courier representative when your handcrafted saree is delivered to
                  your address.
                </p>

                <ul className="cod-perks-list">
                  <li>
                    <span className="check-bullet">✓</span> Zero extra COD processing or handling fee.
                  </li>
                  <li>
                    <span className="check-bullet">✓</span> Please keep the exact cash amount ready for smooth handover.
                  </li>
                  <li>
                    <span className="check-bullet">✓</span> Authentic handloom guarantee with intact seal packaging.
                  </li>
                </ul>

                <div className="pane-action-bar">
                  <button
                    type="button"
                    className="pane-primary-btn"
                    onClick={handleCODOrder}
                    disabled={isProcessing || isPricingLoading}
                  >
                    {isProcessing ? "Placing Order..." : "Confirm & Place Order (Cash on Delivery)"}
                  </button>
                </div>
              </div>
            )}

            {/* DYNAMIC CONTENT VIEW 4: EMI (Unavailable State) */}
            {selectedMethod === "emi" && (
              <div className="dynamic-payment-pane">
                <div className="pane-header">
                  <h3 className="pane-title">EMI Payments</h3>
                  <span className="method-badge-unavailable">Currently Unavailable</span>
                </div>
                <div className="unavailable-notice-box">
                  <p>
                    Equated Monthly Installment (EMI) options are not currently active for this store.
                    Please choose <strong>UPI</strong>, <strong>Credit/Debit Card</strong>, or{" "}
                    <strong>Cash on Delivery</strong> to complete your order.
                  </p>
                </div>
              </div>
            )}

            {/* DYNAMIC CONTENT VIEW 5: GIFT CARD (Unavailable State) */}
            {selectedMethod === "gift_card" && (
              <div className="dynamic-payment-pane">
                <div className="pane-header">
                  <h3 className="pane-title">Gift Card</h3>
                  <span className="method-badge-unavailable">Unavailable</span>
                </div>
                <div className="unavailable-notice-box">
                  <p>
                    Gift card and voucher redemptions are not enabled at this time. Please use another
                    payment option.
                  </p>
                </div>
              </div>
            )}
          </main>

          {/* PANEL 3: RIGHT PANEL — Price Summary */}
          <aside className="panel-right-summary">
            <div className="summary-card">
              <h3 className="summary-title">Price Details</h3>
              <p className="summary-item-count">
                {cart.length} Handloom Saree{cart.length > 1 ? "s" : ""}
              </p>

              <div className="summary-rows-group">
                {/* Total MRP */}
                <div className="price-row">
                  <span>Total MRP / Subtotal</span>
                  <span>
                    {isPricingLoading ? "..." : `₹${pricing.mrpSubtotal.toLocaleString("en-IN")}`}
                  </span>
                </div>

                {/* Saree Discount Savings */}
                {pricing.productDiscount > 0 && (
                  <div className="price-row row-discount">
                    <span>Discount on MRP</span>
                    <span className="text-success">
                      -₹{pricing.productDiscount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                {/* Coupon Discount */}
                {pricing.couponDiscount > 0 && (
                  <div className="price-row row-discount">
                    <span>Coupon Savings</span>
                    <span className="text-success">
                      -₹{pricing.couponDiscount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                {/* Delivery / Shipping Charges */}
                <div className="price-row">
                  <span>Shipping Fee</span>
                  <span>
                    {pricing.shippingCharge === 0 ? (
                      <span className="text-success">FREE</span>
                    ) : (
                      `₹${pricing.shippingCharge.toLocaleString("en-IN")}`
                    )}
                  </span>
                </div>

                {/* Handling Fee */}
                <div className="price-row">
                  <span>Payment Handling Fee</span>
                  <span className="text-success">FREE</span>
                </div>
              </div>

              <div className="summary-divider"></div>

              {/* Total Payable Amount */}
              <div className="price-row total-payable-row">
                <span>Total Payable</span>
                <span className="final-price">
                  {isPricingLoading ? "..." : `₹${pricing.totalAmount.toLocaleString("en-IN")}`}
                </span>
              </div>

              {/* Total Savings Highlight */}
              {totalSavings > 0 && (
                <div className="savings-badge-pill">
                  🎉 You will save ₹{totalSavings.toLocaleString("en-IN")} on this order
                </div>
              )}

              {/* Security Footnote */}
              <div className="summary-safety-box">
                <span className="safety-icon">🛡️</span>
                <p>
                  Safe &amp; Secure Payments. Easy returns for defective or damaged handlooms.
                </p>
              </div>

              <button
                type="button"
                className="cart-return-link"
                onClick={() => navigate("/cart")}
              >
                ← Back to Cart
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Checkout;