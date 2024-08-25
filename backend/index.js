const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoURI = process.env.DB_PASS;
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Define schemas
const customerSchema = new mongoose.Schema({}, { strict: false });
const productSchema = new mongoose.Schema({}, { strict: false });
const orderSchema = new mongoose.Schema({}, { strict: false });

// Define models
const Customer = mongoose.model("Customer", customerSchema, "shopifyCustomers");
const Product = mongoose.model("Product", productSchema, "shopifyProducts");
const Order = mongoose.model("Order", orderSchema, "shopifyOrders");

// API Routes

// 1. Total Sales Over Time
app.get("/api/total-sales", async (req, res) => {
  try {
    const { timeFrame } = req.query;
    let groupBy, sortBy;

    switch (timeFrame) {
      case "daily":
        groupBy = {
          year: { $year: "$createdAtDate" },
          month: { $month: "$createdAtDate" },
          day: { $dayOfMonth: "$createdAtDate" },
        };
        sortBy = { "_id.year": 1, "_id.month": 1, "_id.day": 1 };
        break;
      case "monthly":
        groupBy = {
          year: { $year: "$createdAtDate" },
          month: { $month: "$createdAtDate" },
        };
        sortBy = { "_id.year": 1, "_id.month": 1 };
        break;
      case "quarterly":
        groupBy = {
          year: { $year: "$createdAtDate" },
          quarter: { $ceil: { $divide: [{ $month: "$createdAtDate" }, 3] } },
        };
        sortBy = { "_id.year": 1, "_id.quarter": 1 };
        break;
      case "yearly":
        groupBy = {
          year: { $year: "$createdAtDate" },
        };
        sortBy = { "_id.year": 1 };
        break;
      default:
        groupBy = {
          year: { $year: "$createdAtDate" },
          month: { $month: "$createdAtDate" },
          day: { $dayOfMonth: "$createdAtDate" },
        };
        sortBy = { "_id.year": 1, "_id.month": 1, "_id.day": 1 };
    }

    const salesData = await Order.aggregate([
      {
        $addFields: {
          createdAtDate: { $toDate: "$created_at" },
        },
      },
      {
        $group: {
          _id: groupBy,
          totalSales: { $sum: { $toDouble: "$total_price" } },
        },
      },
      { $sort: sortBy },
    ]);

    console.log(`Time frame: ${timeFrame}`);
    console.log(`Data points: ${salesData.length}`);
    console.log(`Sample data:`, salesData.slice(0, 3));

    res.json(salesData);
  } catch (error) {
    console.error("Error in /api/total-sales:", error);
    res.status(500).json({ message: error.message });
  }
});

// 2. Sales Growth Rate Over Time
// 2. Sales Growth Rate Over Time
app.get("/api/sales-growth", async (req, res) => {
  try {
    const salesData = await Order.aggregate([
      {
        $addFields: {
          createdAtDate: { $toDate: "$created_at" },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAtDate" },
            month: { $month: "$createdAtDate" },
          },
          totalSales: { $sum: { $toDouble: "$total_price" } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const growthData = salesData.map((current, index, array) => {
      if (index === 0) return { ...current, growthRate: 0 };
      const previous = array[index - 1];
      const growthRate =
        ((current.totalSales - previous.totalSales) / previous.totalSales) *
        100;
      return { ...current, growthRate };
    });

    res.json(growthData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. New Customers Added Over Time
app.get("/api/new-customers", async (req, res) => {
  try {
    const newCustomersData = await Customer.aggregate([
      {
        $addFields: {
          createdAtDate: { $toDate: "$created_at" },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAtDate" },
            month: { $month: "$createdAtDate" },
          },
          newCustomers: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    res.json(newCustomersData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. Number of Repeat Customers
app.get("/api/repeat-customers", async (req, res) => {
  try {
    const repeatCustomersData = await Order.aggregate([
      {
        $addFields: {
          createdAtDate: { $toDate: "$created_at" },
        },
      },
      {
        $group: {
          _id: {
            customerId: "$customer.id",
            year: { $year: "$createdAtDate" },
            month: { $month: "$createdAtDate" },
            day: { $dayOfMonth: "$createdAtDate" },
            quarter: { $ceil: { $divide: [{ $month: "$createdAtDate" }, 3] } },
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: {
            customerId: "$_id.customerId",
          },
          uniqueDays: {
            $addToSet: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day",
            },
          },
          uniqueMonths: {
            $addToSet: { year: "$_id.year", month: "$_id.month" },
          },
          uniqueQuarters: {
            $addToSet: { year: "$_id.year", quarter: "$_id.quarter" },
          },
          uniqueYears: { $addToSet: "$_id.year" },
        },
      },
      {
        $project: {
          isRepeatDaily: { $gt: [{ $size: "$uniqueDays" }, 1] },
          isRepeatMonthly: { $gt: [{ $size: "$uniqueMonths" }, 1] },
          isRepeatQuarterly: { $gt: [{ $size: "$uniqueQuarters" }, 1] },
          isRepeatYearly: { $gt: [{ $size: "$uniqueYears" }, 1] },
        },
      },
      {
        $group: {
          _id: null,
          dailyRepeatCustomers: { $sum: { $cond: ["$isRepeatDaily", 1, 0] } },
          monthlyRepeatCustomers: {
            $sum: { $cond: ["$isRepeatMonthly", 1, 0] },
          },
          quarterlyRepeatCustomers: {
            $sum: { $cond: ["$isRepeatQuarterly", 1, 0] },
          },
          yearlyRepeatCustomers: { $sum: { $cond: ["$isRepeatYearly", 1, 0] } },
        },
      },
    ]);

    const result = repeatCustomersData[0] || {
      dailyRepeatCustomers: 0,
      monthlyRepeatCustomers: 0,
      quarterlyRepeatCustomers: 0,
      yearlyRepeatCustomers: 0,
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 5. Geographical Distribution of Customers
app.get("/api/customer-distribution", async (req, res) => {
  try {
    const distribution = await Customer.aggregate([
      {
        $group: {
          _id: "$default_address.city",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
    res.json(distribution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 6. Customer Lifetime Value by Cohorts

app.get("/api/customer-ltv", async (req, res) => {
  try {
    const ltvData = await Customer.aggregate([
      {
        $addFields: {
          firstPurchaseMonth: {
            $dateToString: {
              format: "%Y-%m",
              date: { $toDate: "$created_at" },
            },
          },
        },
      },
      {
        $lookup: {
          from: "shopifyOrders",
          localField: "_id",
          foreignField: "customer_id",
          as: "orders",
        },
      },
      {
        $unwind: {
          path: "$orders",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$firstPurchaseMonth",
          totalRevenue: {
            $sum: {
              $convert: {
                input: "$orders.total_price",
                to: "double",
                onError: 0,
                onNull: 0,
              },
            },
          },
          customerCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const cohortData = ltvData.map((cohort) => ({
      month: cohort._id,
      totalRevenue: cohort.totalRevenue,
      customerCount: cohort.customerCount,
      averageRevenue: cohort.totalRevenue / cohort.customerCount,
    }));

    res.json(cohortData);
  } catch (error) {
    console.error("Error in /api/customer-ltv:", error);
    res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
