import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";

import Message from "../../components/Message.jsx";
import Loader from "../../components/Loader.jsx";

import {
  useCreateOrderMutation,
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
} from "../../redux/api/orderApiSlice.js";

import { clearCartItems } from "../../redux/features/cart/cartSlice.js";

// Load Razorpay Checkout script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Don't load the script again if it already exists
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

const PlaceOrder = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);

  // Create MongoDB order
  const [createOrder, { isLoading: isCreatingOrder, error }] =
    useCreateOrderMutation();

  // Create Razorpay order
  const [createRazorpayOrder, { isLoading: isCreatingRazorpay }] =
    useCreateRazorpayOrderMutation();

  // Verify Razorpay payment
  const [verifyRazorpayPayment, { isLoading: isVerifyingPayment }] =
    useVerifyRazorpayPaymentMutation();

  // Redirect if shipping address doesn't exist
  useEffect(() => {
    if (!cart.shippingAddress?.address) {
      navigate("/shipping");
    }
  }, [cart.shippingAddress, navigate]);

  const placeOrderHandler = async () => {
    try {
      // ------------------------------------------------
      // STEP 1: Create order in MongoDB
      // ------------------------------------------------
      const order = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      }).unwrap();

      console.log("MongoDB Order:", order);

      // ------------------------------------------------
      // STEP 2: Create Razorpay order
      // ------------------------------------------------
      const razorpayOrder = await createRazorpayOrder(
        order._id
      ).unwrap();

      console.log("Razorpay Order:", razorpayOrder);

      // ------------------------------------------------
      // STEP 3: Load Razorpay Checkout script
      // ------------------------------------------------
      const loaded = await loadRazorpayScript();

      if (!loaded) {
        toast.error("Razorpay SDK failed to load");
        return;
      }

      // ------------------------------------------------
      // STEP 4: Razorpay Checkout configuration
      // ------------------------------------------------
      const options = {
        key: razorpayOrder.key,

        amount: razorpayOrder.amount,

        currency: razorpayOrder.currency,

        name: "ShopMind AI",

        description: "Ecommerce Order",

        order_id: razorpayOrder.id,

        handler: async function (response) {
          console.log("Razorpay Response:", response);

          try {
            // --------------------------------------------
            // STEP 5: Verify payment on backend
            // --------------------------------------------
            const verifiedOrder =
              await verifyRazorpayPayment({
                orderId: order._id,
                paymentData: response,
              }).unwrap();

            console.log(
              "Payment Verified:",
              verifiedOrder
            );

            // --------------------------------------------
            // STEP 6: Clear cart ONLY after verification
            // --------------------------------------------
            dispatch(clearCartItems());

            toast.success("Payment successful!");

            // --------------------------------------------
            // STEP 7: Navigate to order details
            // --------------------------------------------
            navigate(`/order/${order._id}`);
          } catch (error) {
            console.error(
              "Payment verification error:",
              error
            );

            toast.error(
              error?.data?.message ||
                error?.message ||
                "Payment verification failed"
            );
          }
        },

        // Optional customer information
        prefill: {
          name: "",
          email: "",
          contact: "",
        },

        notes: {
          orderId: order._id,
        },

        theme: {
          color: "#ec4899",
        },
      };

      // ------------------------------------------------
      // STEP 8: Create Razorpay instance
      // ------------------------------------------------
      const razorpay = new window.Razorpay(options);

      // ------------------------------------------------
      // STEP 9: Handle payment failure
      // ------------------------------------------------
      razorpay.on("payment.failed", function (response) {
        console.error(
          "Razorpay Payment Failed:",
          response
        );

        toast.error(
          response.error?.description ||
            "Payment failed"
        );
      });

      // ------------------------------------------------
      // STEP 10: Open Razorpay Checkout
      // ------------------------------------------------
      razorpay.open();
    } catch (error) {
      console.error("Order error:", error);

      toast.error(
        error?.data?.message ||
          error?.message ||
          "Failed to create order"
      );
    }
  };

  const isProcessing =
    isCreatingOrder ||
    isCreatingRazorpay ||
    isVerifyingPayment;

  return (
    <div className="container mx-auto mt-8 ml-20">
      {/* Cart Items */}
      {cart.cartItems.length === 0 ? (
        <Message>Your cart is empty</Message>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <td className="px-1 py-2 text-left">
                  Image
                </td>

                <td className="px-1 py-2 text-left">
                  Product
                </td>

                <td className="px-1 py-2 text-left">
                  Quantity
                </td>

                <td className="px-1 py-2 text-left">
                  Price
                </td>

                <td className="px-1 py-2 text-left">
                  Total
                </td>
              </tr>
            </thead>

            <tbody>
              {cart.cartItems.map((item, index) => (
                <tr key={item.product || index}>
                  <td className="p-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover"
                    />
                  </td>

                  <td className="p-2">
                    <Link
                      to={`/product/${item.product}`}
                    >
                      {item.name}
                    </Link>
                  </td>

                  <td className="p-2">
                    {item.qty}
                  </td>

                  <td className="p-2">
                    {Number(item.price).toFixed(2)}
                  </td>

                  <td className="p-2">
                    $
                    {(
                      item.qty * item.price
                    ).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Summary */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-5">
          Order Summary
        </h2>

        <div className="flex flex-wrap p-8">
          {/* Price Details */}
          <ul className="text-lg">
            <li>
              <span className="font-semibold">
                Items:
              </span>{" "}
              ${cart.itemsPrice}
            </li>

            <li>
              <span className="font-semibold">
                Shipping:
              </span>{" "}
              ${cart.shippingPrice}
            </li>

            <li>
              <span className="font-semibold">
                Tax:
              </span>{" "}
              ${cart.taxPrice}
            </li>

            <li>
              <span className="font-semibold">
                Total:
              </span>{" "}
              ${cart.totalPrice}
            </li>
          </ul>

          {/* Backend Error */}
          {error && (
            <Message variant="danger">
              {error?.data?.message ||
                "Something went wrong"}
            </Message>
          )}

          {/* Shipping */}
          <div className="ml-100">
            <h2 className="text-2xl font-semibold mb-4">
              Shipping
            </h2>

            <p>
              <strong>Address:</strong>{" "}
              {cart.shippingAddress.address},{" "}
              {cart.shippingAddress.city}{" "}
              {cart.shippingAddress.postalCode},{" "}
              {cart.shippingAddress.country}
            </p>
          </div>

          {/* Payment Method */}
          <div className="ml-50">
            <h2 className="text-2xl font-semibold mb-4">
              Payment Method
            </h2>

            <strong>Method:</strong>{" "}
            {cart.paymentMethod}
          </div>
        </div>

        {/* Payment Button */}
        <button
          type="button"
          className="bg-pink-500 py-2 px-4 rounded-full text-lg w-full mt-4"
          disabled={
            cart.cartItems.length === 0 ||
            isProcessing
          }
          onClick={placeOrderHandler}
        >
          {isProcessing
            ? "Processing Payment..."
            : "Pay with Razorpay"}
        </button>

        {isProcessing && <Loader />}
      </div>
    </div>
  );
};

export default PlaceOrder;