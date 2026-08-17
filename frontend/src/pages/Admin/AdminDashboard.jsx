import { useEffect, useState } from "react";
import Chart from "react-apexcharts";

import AdminMenu from "./AdminMenu";
import OrderList from "./OrderList";
import Loader from "../../components/Loader";

import { useGetUsersQuery } from "../../redux/api/usersApiSlice";

import {
  useGetTotalOrdersQuery,
  useGetTotalSalesByDateQuery,
  useGetTotalSalesQuery,
} from "../../redux/api/orderApiSlice";

const AdminDashboard = () => {
  // =========================
  // API DATA
  // =========================

  const {
    data: sales,
    isLoading: isSalesLoading,
    isError: isSalesError,
  } = useGetTotalSalesQuery();

  const {
    data: customers,
    isLoading: isCustomersLoading,
    isError: isCustomersError,
  } = useGetUsersQuery();

  const {
    data: orders,
    isLoading: isOrdersLoading,
    isError: isOrdersError,
  } = useGetTotalOrdersQuery();

  const {
    data: salesDetail,
    isLoading: isSalesDetailLoading,
    isError: isSalesDetailError,
  } = useGetTotalSalesByDateQuery();

  // =========================
  // CHART STATE
  // =========================

  const [chartOptions, setChartOptions] = useState({
    chart: {
      type: "line",
      toolbar: {
        show: true,
      },
      zoom: {
        enabled: true,
      },
    },

    title: {
      text: "Sales Trend",
      align: "left",
    },

    xaxis: {
      categories: [],
      title: {
        text: "Date",
      },
    },

    yaxis: {
      min: 0,
      title: {
        text: "Sales",
      },
    },

    stroke: {
      curve: "smooth",
      width: 3,
    },

    markers: {
      size: 4,
    },

    dataLabels: {
      enabled: false,
    },

    tooltip: {
      theme: "dark",
    },

    grid: {
      borderColor: "#ccc",
    },

    legend: {
      position: "top",
    },
  });

  const [chartSeries, setChartSeries] = useState([
    {
      name: "Sales",
      data: [],
    },
  ]);

  // =========================
  // UPDATE CHART
  // =========================

  useEffect(() => {
    if (!salesDetail || !Array.isArray(salesDetail)) {
      return;
    }

    const categories = salesDetail.map((item) => item._id);

    const salesData = salesDetail.map(
      (item) => Number(item.totalSales) || 0
    );

    setChartOptions((previous) => ({
      ...previous,

      xaxis: {
        ...previous.xaxis,
        categories,
      },
    }));

    setChartSeries([
      {
        name: "Sales",
        data: salesData,
      },
    ]);
  }, [salesDetail]);

  // =========================
  // DASHBOARD CARD
  // =========================

  const DashboardCard = ({
    title,
    value,
    icon,
    loading,
    error,
  }) => {
    return (
      <div className="w-[20rem] rounded-lg bg-black p-5 mt-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-500 text-xl font-bold">
            {icon}
          </div>
        </div>

        <p className="mt-5 text-gray-400">{title}</p>

        <h1 className="mt-2 text-2xl font-bold">
          {loading ? (
            <Loader />
          ) : error ? (
            "Error"
          ) : (
            value
          )}
        </h1>
      </div>
    );
  };

  // =========================
  // VALUES
  // =========================

  const totalSales = Number(sales?.totalSales || 0);

  const totalCustomers = customers?.length || 0;

  const totalOrders = Number(orders?.totalOrders || 0);

  // =========================
  // UI
  // =========================

  return (
    <>
      <AdminMenu />

      <section className="xl:ml-[4rem] md:ml-0 px-5 py-5">
        {/* =========================
            DASHBOARD HEADER
        ========================= */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-gray-400">
            Overview of your store performance
          </p>
        </div>

        {/* =========================
            STAT CARDS
        ========================= */}

        <div className="flex w-full flex-wrap gap-5">
          <DashboardCard
            title="Total Sales"
            value={`$ ${totalSales.toFixed(2)}`}
            icon="$"
            loading={isSalesLoading}
            error={isSalesError}
          />

          <DashboardCard
            title="Customers"
            value={totalCustomers}
            icon="👤"
            loading={isCustomersLoading}
            error={isCustomersError}
          />

          <DashboardCard
            title="Total Orders"
            value={totalOrders}
            icon="📦"
            loading={isOrdersLoading}
            error={isOrdersError}
          />
        </div>

        {/* =========================
            SALES CHART
        ========================= */}

        <div className="mt-12 rounded-lg bg-black p-5 shadow-lg">
          <div className="mb-5">
            <h2 className="text-xl font-bold">
              Sales Analytics
            </h2>

            <p className="text-sm text-gray-400">
              Sales performance over time
            </p>
          </div>

          {isSalesDetailLoading ? (
            <div className="flex justify-center py-10">
              <Loader />
            </div>
          ) : isSalesDetailError ? (
            <div className="py-10 text-center text-red-400">
              Failed to load sales data.
            </div>
          ) : salesDetail?.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <Chart
                options={chartOptions}
                series={chartSeries}
                type="line"
                height={400}
                width="100%"
              />
            </div>
          ) : (
            <div className="py-10 text-center text-gray-400">
              No sales data available.
            </div>
          )}
        </div>

        {/* =========================
            ORDERS
        ========================= */}

        <div className="mt-12">
          <div className="mb-5">
            <h2 className="text-2xl font-bold">
              Recent Orders
            </h2>

            <p className="text-gray-400">
              Manage your latest customer orders
            </p>
          </div>

          <OrderList />
        </div>
      </section>
    </>
  );
};

export default AdminDashboard;