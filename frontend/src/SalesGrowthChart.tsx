/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const SalesGrowthChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PATH}/api/sales-growth`
      );
      const growthData = await response.json();

      const formattedData = growthData.map(
        (item: {
          _id: { year: any; month: { toString: () => string } };
          growthRate: number;
        }) => ({
          date: `${item._id.year}-${item._id.month
            .toString()
            .padStart(2, "0")}`,
          growthRate: parseFloat(item.growthRate.toFixed(2)),
        })
      );

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching sales growth data:", error);
    }
  };

  const formatYAxis = (tickItem: any) => {
    return `${tickItem}%`;
  };

  const formatTooltip = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis
          tickFormatter={formatYAxis}
          domain={["auto", "auto"]}
          padding={{ top: 20, bottom: 20 }}
        />
        <Tooltip formatter={formatTooltip} />
        <ReferenceLine y={0} stroke="#000" />
        <Bar dataKey="growthRate" />
        {/* fill={(entry: { growthRate: number; }) => entry.growthRate >= 0 ? "#4CAF50" : "#FF5252"} */}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SalesGrowthChart;
