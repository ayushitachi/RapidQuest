/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const CustomerDistributionChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PATH}/api/customer-distribution`
      );
      const distributionData = await response.json();

      // Sort cities by customer count in descending order
      distributionData.sort(
        (a: { count: number }, b: { count: number }) => b.count - a.count
      );

      const formattedData = distributionData.map(
        (city: { _id: any; count: any }) => ({
          name: city._id,
          customers: city.count,
        })
      );

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching customer distribution data:", error);
    }
  };

  const CustomTooltip: React.FC<{
    active?: boolean;
    payload?: Array<{ payload: { customers: number } }>;
    label?: string;
  }> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const { customers } = payload[0].payload;
      const total = data.reduce((sum, entry) => sum + entry["customers"], 0);
      const percentage = ((customers / total) * 100).toFixed(2);
      return (
        <div
          style={{
            backgroundColor: "white",
            padding: "5px",
            border: "1px solid #ccc",
          }}
        >
          <p>{`${label}: ${customers.toLocaleString()} customers`}</p>
          <p>{`${percentage}%`}</p>
        </div>
      );
    }
    return null;
  };

  const chartWidth = Math.max(data.length * 40, 1000); // Ensure minimum width of 1000px

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <div style={{ width: `${chartWidth}px`, height: "500px" }}>
        <BarChart
          data={data}
          width={chartWidth}
          height={500}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            interval={0}
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="customers" fill="#8884d8" />
        </BarChart>
      </div>
    </div>
  );
};

export default CustomerDistributionChart;
