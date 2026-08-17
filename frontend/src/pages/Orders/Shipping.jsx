
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  saveShippingAddress,
  savePaymentMethod,
} from "../../redux/features/cart/cartSlice.js";

import ProgressSteps from "../../components/ProgressSteps.jsx";

const Shipping = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [paymentMethod, setPaymentMethod] = useState("RazorPay");

  const [address, setAddress] = useState(
    shippingAddress.address || ""
  );

  const [city, setCity] = useState(
    shippingAddress.city || ""
  );

  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || ""
  );

  const [country, setCountry] = useState(
    shippingAddress.country || ""
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();

    dispatch(
      saveShippingAddress({
        address,
        city,
        postalCode,
        country,
      })
    );

    dispatch(savePaymentMethod(paymentMethod));

    navigate("/placeorder");
  };

  return (
    <div className="container mx-auto mt-8">

      <ProgressSteps step1 step2 />

      <div className="mt-8 max-w-xl mx-auto">

        <h1 className="text-3xl font-semibold mb-6">
          Shipping
        </h1>

        <form onSubmit={submitHandler}>

          {/* Address */}
          <div className="mb-4">
            <label className="block mb-2">
              Address
            </label>

            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Enter address"
              value={address}
              required
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* City */}
          <div className="mb-4">
            <label className="block mb-2">
              City
            </label>

            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Enter city"
              value={city}
              required
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          {/* Postal Code */}
          <div className="mb-4">
            <label className="block mb-2">
              Postal Code
            </label>

            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Enter postal code"
              value={postalCode}
              required
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>

          {/* Country */}
          <div className="mb-4">
            <label className="block mb-2">
              Country
            </label>

            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Enter country"
              value={country}
              required
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              Select Method
            </h2>

            <label className="flex items-center">
              <input
                type="radio"
                className="form-radio text-pink-500"
                name="paymentMethod"
                value="RazorPay"
                checked={paymentMethod === "RazorPay"}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
              />

              <span className="ml-2">
                RazorPay or Credit Card
              </span>
            </label>
          </div>

          {/* Continue */}
          <button
            className="bg-pink-500 text-white py-2 px-4 rounded-full text-lg w-full"
            type="submit"
          >
            Continue
          </button>

        </form>
      </div>
    </div>
  );
};

export default Shipping;

