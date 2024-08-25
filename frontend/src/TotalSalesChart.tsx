/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TotalSalesChart = () => {
  const [data, setData] = useState([]);
  const [timeFrame, setTimeFrame] = useState("monthly");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData(timeFrame);
  }, [timeFrame]);

  const fetchData = async (selectedTimeFrame: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_PATH
        }/api/total-sales?timeFrame=${selectedTimeFrame}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const salesData = await response.json();

      const formattedData = salesData.map(
        (item: { _id: any; totalSales: number }) => ({
          date: formatDate(item._id, selectedTimeFrame),
          sales: parseFloat(item.totalSales.toFixed(2)),
        })
      );

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching total sales data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (
    dateObj: { day: any; month: any; year: any; quarter: any },
    selectedTimeFrame: any
  ) => {
    switch (selectedTimeFrame) {
      case "daily":
        return `${String(dateObj.day).padStart(2, "0")}/${String(
          dateObj.month
        ).padStart(2, "0")}/${String(dateObj.year).slice(2)}`;
      case "monthly":
        return `${dateObj.year}-${String(dateObj.month).padStart(2, "0")}`;
      case "quarterly":
        return `${dateObj.year}-Q${dateObj.quarter}`;
      case "yearly":
        return `${dateObj.year}`;
      default:
        return "";
    }
  };

  const handleTimeFrameChange = (
    newTimeFrame: React.SetStateAction<string>
  ) => {
    setTimeFrame(newTimeFrame);
  };

  return (
    <div>
      <Select onValueChange={handleTimeFrameChange} value={timeFrame}>
        <SelectTrigger className="w-[180px] mb-4">
          <SelectValue placeholder="Select time frame" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="quarterly">Quarterly</SelectItem>
          <SelectItem value="yearly">Yearly</SelectItem>
        </SelectContent>
      </Select>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div
          style={{
            width: "100%",
            height: 300,
            overflowX: timeFrame === "daily" ? "scroll" : "hidden",
          }}
        >
          <div
            style={{
              width: timeFrame === "daily" ? `${data.length * 50}px` : "100%",
              minWidth: "100%",
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  interval={timeFrame === "daily" ? 0 : "preserveStartEnd"}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default TotalSalesChart;
