import { useGetTopProductsQuery } from "../../redux/api/productApiSlice";
import Message from "../../components/Message";
import moment from "moment";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import {
  FaBox,
  FaClock,
  FaShoppingCart,
  FaStar,
  FaStore,
} from "react-icons/fa";

const ProductCarousel = () => {
  const { data: products, isLoading, error } = useGetTopProductsQuery();

  return (
    <div className="mb-4 lg:block xl:block md:block">
      {isLoading ? null : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation
          loop={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          spaceBetween={20}
          className="xl:w-[50rem] lg:w-[50rem] md:w-[56rem] sm:w-[40rem] sm:block"
        >
          {products.map(
            ({
              image,
              _id,
              name,
              price,
              description,
              brand,
              createdAt,
              numReviews,
              rating,
              quantity,
              countInStock,
            }) => (
              <SwiperSlide key={_id}>
                <div>
                  <img
                    src={image}
                    alt={name}
                    className="w-5xl rounded-lg object-cover h-[30rem] mt-8"
                  />

                  <div className="mt-4 flex justify-between">
                    <div>
                      <h2>{name}</h2>

                      <p>$ {price}</p>

                      <br />
                      <br />

                      <p className="w-[25rem]">
                        {description.substring(0, 170)}...
                      </p>
                    </div>

                    <div className="flex justify-between w-[20rem]">
                      <div>
                        <h1 className="flex items-center mb-6">
                          <FaStore className="mr-2 " />
                          Brand: {brand}
                        </h1>

                        <h1 className="flex items-center mb-6">
                          <FaClock className="mr-2 " />
                          Added: {moment(createdAt).fromNow()}
                        </h1>

                        <h1 className="flex items-center mb-6">
                          <FaStar className="mr-2 " />
                          Reviews: {numReviews}
                        </h1>
                      </div>

                      <div>
                        <h1 className="flex items-center mb-6">
                          <FaStar className="mr-2" />
                          Ratings: {Math.round(rating)}
                        </h1>

                        <h1 className="flex items-center mb-6">
                          <FaShoppingCart className="mr-2" />
                          Quantity: {quantity}
                        </h1>

                        <h1 className="flex items-center mb-6">
                          <FaBox className="mr-2 " />
                          In Stock: {countInStock}
                        </h1>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            )
          )}
        </Swiper>
      )}
    </div>
  );
};

export default ProductCarousel;