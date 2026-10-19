import React, { useState, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import { AuthContext } from "../context/AuthContext";
import { clearCart } from "../redux/cartSlice";
import "../styles/cart.css";

const stripePromise = loadStripe(
  "pk_test_51LvdGASGXtUoYRLzUHg0K0Vo4XcpgyFaW2YTBQEpBnfkcAhSgavP54nB53cGCPIZUyNoPntPmwmE73FJbHyAxlqq00UW0KQyqb",
);

const CheckoutForm = () => {
  const { user } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.qty,
    0,
  );

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!user?.token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    if (!cartItems.length || totalPrice <= 0) {
      alert("Your cart is empty");
      return;
    }

    if (!stripe || !elements) {
      alert("Stripe is still loading. Please try again.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create a PaymentIntent on your backend.
      const orderRes = await fetch("/api/payment/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          amount: Math.round(totalPrice * 100),
        }),
      });

      const orderData = await orderRes.json();
      console.log("Payment order response:1", orderData);

 if (!orderData.success) {
  throw new Error(orderData.message || "Unable to initialize payment");
}



      // Step 2: Confirm the card payment with Stripe.
      const cardElement = elements.getElement(CardElement);

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        orderData.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: address.fullName,
              email: user.email,
              address: {
                line1: address.street,
                city: address.city,
                postal_code: address.postalCode,
                country: address.country,
              },
            },
          },
        },
      );

      if (error) {
        alert(error.message || "Payment failed");
        return;
      }

      if (paymentIntent?.status !== "succeeded") {
        alert("Payment has not been completed.");
        return;
      }

      // Step 3: Save the order after successful payment.
      // The backend must independently verify this PaymentIntent.
      const saveOrderRes = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          items: cartItems,
          totalAmount: totalPrice,
          address,
          paymentId: paymentIntent.id,
        }),
      });

      const savedOrder = await saveOrderRes.json();

      if (!saveOrderRes.ok) {
        alert(
          "Payment succeeded, but order saving failed. Contact support and provide payment ID: " +
            paymentIntent.id,
        );
        return;
      }

      // Step 4: Clear cart only after the order is saved.
      dispatch(clearCart());
      navigate("/ordersuccess");
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error.message || "Something went wrong during checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Checkout</h2>

      <div className="checkout-content">
        <form onSubmit={handlePayment} className="shipping-form">
          <h3>Shipping Address</h3>

          <input
            type="text"
            placeholder="Full Name"
            required
            value={address.fullName}
            onChange={(e) =>
              setAddress({ ...address, fullName: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Street"
            required
            value={address.street}
            onChange={(e) => setAddress({ ...address, street: e.target.value })}
          />

          <input
            type="text"
            placeholder="City"
            required
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
          />

          <input
            type="text"
            placeholder="Postal Code"
            required
            value={address.postalCode}
            onChange={(e) =>
              setAddress({ ...address, postalCode: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Country (e.g. IN)"
            required
            maxLength={2}
            value={address.country}
            onChange={(e) =>
              setAddress({
                ...address,
                country: e.target.value.toUpperCase(),
              })
            }
          />

          <h3>Card Details</h3>

          <div className="stripe-card">
            <CardElement
              options={{
                hidePostalCode: true,
                style: {
                  base: {
                    background: "#c91f90",
                    fontSize: "16px",
                    color: "#f6f6fa",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                  invalid: {
                    color: "#dc2626",
                  },
                },
              }}
            />
          </div>

          <div className="checkout-summary">
            <h4>Total to Pay: ₹{totalPrice.toFixed(2)}</h4>

            <button
              type="submit"
              className="btn"
              disabled={loading || !stripe || cartItems.length === 0}
            >
              {loading ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Checkout = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout;
