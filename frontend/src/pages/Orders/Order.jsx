import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
  useGetOrderDetailsQuery,
  useDeliverOrderMutation,
} from "../../redux/api/orderApiSlice.js";

import Message from "../../components/Message.jsx";
import Loader from "../../components/Loader.jsx";

const Order = () => {
  const { id: orderId } = useParams();

  const { userInfo } = useSelector((state) => state.auth);

  // Get order details
  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useGetOrderDetailsQuery(orderId);

  // Admin delivery mutation
  const [deliverOrder, { isLoading: loadingDeliver }] =
    useDeliverOrderMutation();

  // --------------------------------------------------
  // Mark order as delivered
  // --------------------------------------------------
  const deliverHandler = async () => {
    try {
      await deliverOrder(orderId).unwrap();

      toast.success("Order marked as delivered");

      refetch();
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Failed to mark order as delivered"
      );
    }
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------
  if (isLoading) {
    return <Loader />;
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------
  if (error) {
    return (
      <Message variant="danger">
        {error?.data?.message || "Failed to load order"}
      </Message>
    );
  }

  // --------------------------------------------------
  // If order doesn't exist
  // --------------------------------------------------
  if (!order) {
    return (
      <Message variant="danger">
        Order not found
      </Message>
    );
  }

  return (
    <div className="container mx-auto mt-8 px-4 ml-15">
      <div className="flex flex-col md:flex-row gap-8">

        {/* ================================================= */}
        {/* LEFT SIDE - ORDER ITEMS */}
        {/* ================================================= */}

        <div className="md:w-2/3">
          <div className="border border-gray-300 rounded-lg p-4 mb-5">

            <h2 className="text-2xl font-bold mb-5">
              Order Items
            </h2>

            {order.orderItems.length === 0 ? (
              <Message>
                Order is empty
              </Message>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">

                  <thead className="border-b-2">
                    <tr>
                      <th className="p-2 text-left">
                        Image
                      </th>

                      <th className="p-2 text-left">
                        Product
                      </th>

                      <th className="p-2 text-center">
                        Quantity
                      </th>

                      <th className="p-2 text-center">
                        Price
                      </th>

                      <th className="p-2 text-center">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {order.orderItems.map(
                      (item, index) => (
                        <tr
                          key={
                            item.product || index
                          }
                          className="border-b"
                        >
                          {/* Image */}
                          <td className="p-2">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          </td>

                          {/* Product */}
                          <td className="p-2">
                            <Link
                              to={`/product/${item.product}`}
                              className="hover:text-pink-500"
                            >
                              {item.name}
                            </Link>
                          </td>

                          {/* Quantity */}
                          <td className="p-2 text-center">
                            {item.qty}
                          </td>

                          {/* Price */}
                          <td className="p-2 text-center">
                            ₹
                            {Number(
                              item.price
                            ).toFixed(2)}
                          </td>

                          {/* Total */}
                          <td className="p-2 text-center">
                            ₹
                            {(
                              item.qty *
                              item.price
                            ).toFixed(2)}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ================================================= */}
        {/* RIGHT SIDE */}
        {/* ================================================= */}

        <div className="md:w-1/3">

          {/* ================================================= */}
          {/* SHIPPING INFORMATION */}
          {/* ================================================= */}

          <div className="border border-gray-300 rounded-lg p-5 mb-5">

            <h2 className="text-xl font-bold mb-4">
              Shipping
            </h2>

            <p className="mb-3">
              <strong className="text-pink-500">
                Order ID:
              </strong>{" "}
              {order._id}
            </p>

            <p className="mb-3">
              <strong className="text-pink-500">
                Name:
              </strong>{" "}
              {order.user?.username}
            </p>

            <p className="mb-3">
              <strong className="text-pink-500">
                Email:
              </strong>{" "}
              {order.user?.email}
            </p>

            <p className="mb-3">
              <strong className="text-pink-500">
                Address:
              </strong>{" "}
              {order.shippingAddress?.address},{" "}
              {order.shippingAddress?.city},{" "}
              {order.shippingAddress?.postalCode},{" "}
              {order.shippingAddress?.country}
            </p>

            <p className="mb-3">
              <strong className="text-pink-500">
                Payment Method:
              </strong>{" "}
              {order.paymentMethod}
            </p>

          </div>

          {/* ================================================= */}
          {/* PAYMENT STATUS */}
          {/* ================================================= */}

          <div className="mb-5">

            <h2 className="text-xl font-bold mb-3">
              Payment Status
            </h2>

            {order.isPaid ? (
              <Message variant="success">
                Payment Successful
              </Message>
            ) : (
              <Message variant="danger">
                Payment Pending
              </Message>
            )}

            {order.isPaid && (
              <div className="mt-3 p-3 bg-gray-100 rounded">

                <p>
                  <strong>
                    Paid At:
                  </strong>{" "}
                  {new Date(
                    order.paidAt
                  ).toLocaleString()}
                </p>

                {order.paymentResult?.id && (
                  <p className="mt-2 break-all">
                    <strong>
                      Payment ID:
                    </strong>{" "}
                    {order.paymentResult.id}
                  </p>
                )}

                {order.paymentResult?.order_id && (
                  <p className="mt-2 break-all">
                    <strong>
                      Razorpay Order ID:
                    </strong>{" "}
                    {order.paymentResult.order_id}
                  </p>
                )}

              </div>
            )}

          </div>

          {/* ================================================= */}
          {/* ORDER SUMMARY */}
          {/* ================================================= */}

          <div className="border border-gray-300 rounded-lg p-5 mb-5">

            <h2 className="text-xl font-bold mb-4">
              Order Summary
            </h2>

            <div className="flex justify-between mb-3">
              <span>Items</span>

              <span>
                ₹{order.itemsPrice}
              </span>
            </div>

            <div className="flex justify-between mb-3">
              <span>Shipping</span>

              <span>
                ₹{order.shippingPrice}
              </span>
            </div>

            <div className="flex justify-between mb-3">
              <span>Tax</span>

              <span>
                ₹{order.taxPrice}
              </span>
            </div>

            <div className="border-t pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>

              <span>
                ₹{order.totalPrice}
              </span>
            </div>

          </div>

          {/* ================================================= */}
          {/* DELIVERY STATUS */}
          {/* ================================================= */}

          <div className="mb-5">

            <h2 className="text-xl font-bold mb-3">
              Delivery Status
            </h2>

            {order.isDelivered ? (
              <Message variant="success">
                Delivered on{" "}
                {new Date(
                  order.deliveredAt
                ).toLocaleString()}
              </Message>
            ) : (
              <Message variant="danger">
                Not Delivered
              </Message>
            )}

          </div>

          {/* ================================================= */}
          {/* ADMIN DELIVERY BUTTON */}
          {/* ================================================= */}

          {userInfo?.isAdmin &&
            order.isPaid &&
            !order.isDelivered && (
              <button
                type="button"
                className="bg-pink-500 hover:bg-pink-600 text-white w-full py-3 rounded-lg font-semibold"
                onClick={deliverHandler}
                disabled={loadingDeliver}
              >
                {loadingDeliver
                  ? "Updating..."
                  : "Mark As Delivered"}
              </button>
            )}

          {loadingDeliver && <Loader />}

        </div>
      </div>
    </div>
  );
};

export default Order;