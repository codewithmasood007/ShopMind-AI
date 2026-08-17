import { apiSlice } from "./apiSlice.js";
import { ORDER_URL } from "../constants.js";

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create MongoDB order
    createOrder: builder.mutation({
      query: (order) => ({
        url: ORDER_URL,
        method: "POST",
        body: order,
      }),
    }),

    // Get order details
    getOrderDetails: builder.query({
      query: (id) => ({
        url: `${ORDER_URL}/${id}`,
      }),
    }),

    // Create Razorpay order
    createRazorpayOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDER_URL}/${orderId}/razorpay`,
        method: "POST",
      }),
    }),

    // Verify Razorpay payment
    verifyRazorpayPayment: builder.mutation({
      query: ({ orderId, paymentData }) => ({
        url: `${ORDER_URL}/${orderId}/razorpay/verify`,
        method: "POST",
        body: paymentData,
      }),
    }),

    // Old payment endpoint - you can remove this later
    payOrder: builder.mutation({
      query: ({ orderId, details }) => ({
        url: `${ORDER_URL}/${orderId}/pay`,
        method: "PUT",
        body: details,
      }),
    }),

    // Get user's orders
    getMyOrders: builder.query({
      query: () => ({
        url: `${ORDER_URL}/mine`,
      }),
      keepUnusedDataFor: 5,
    }),

    // Admin: get all orders
    getOrders: builder.query({
      query: () => ({
        url: ORDER_URL,
      }),
    }),

    // Admin: deliver order
    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDER_URL}/${orderId}/deliver`,
        method: "PUT",
      }),
    }),

    // Admin statistics
    getTotalOrders: builder.query({
      query: () => `${ORDER_URL}/total-orders`,
    }),

    getTotalSales: builder.query({
      query: () => `${ORDER_URL}/total-sales`,
    }),

    getTotalSalesByDate: builder.query({
      query: () => `${ORDER_URL}/total-sales-by-date`,
    }),
  }),
});

export const {
  useGetTotalOrdersQuery,
  useGetTotalSalesQuery,
  useGetTotalSalesByDateQuery,

  useCreateOrderMutation,
  useGetOrderDetailsQuery,

  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,

  usePayOrderMutation,

  useGetMyOrdersQuery,
  useDeliverOrderMutation,
  useGetOrdersQuery,
} = orderApiSlice;