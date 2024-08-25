const mongoose = require("mongoose");

// Define the schema for the shopifyOrders collection
const shopifyOrderSchema = new mongoose.Schema(
  {
    created_at: Date,
    total_price_set: {
      shop_money: {
        amount: Number,
        currency_code: String,
      },
    },
  },
  { strict: false }
); // Use strict: false to allow for flexible document structure

const ShopifyOrder = mongoose.model(
  "ShopifyOrder",
  shopifyOrderSchema,
  "shopifyOrders"
);

async function getTotalSalesOverTime() {
  try {
    const pipeline = [
      {
        $group: {
          _id: {
            year: { $year: "$created_at" },
            month: { $month: "$created_at" },
            day: { $dayOfMonth: "$created_at" },
            quarter: { $ceil: { $divide: [{ $month: "$created_at" }, 3] } },
          },
          dailySales: { $sum: "$total_price_set.shop_money.amount" },
        },
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month",
            quarter: "$_id.quarter",
          },
          monthlySales: { $sum: "$dailySales" },
          dailySales: { $push: { day: "$_id.day", sales: "$dailySales" } },
        },
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            quarter: "$_id.quarter",
          },
          quarterlySales: { $sum: "$monthlySales" },
          monthlySales: {
            $push: {
              month: "$_id.month",
              sales: "$monthlySales",
              dailySales: "$dailySales",
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id.year",
          yearlySales: { $sum: "$quarterlySales" },
          quarterlySales: {
            $push: {
              quarter: "$_id.quarter",
              sales: "$quarterlySales",
              monthlySales: "$monthlySales",
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ];

    const result = await ShopifyOrder.aggregate(pipeline);
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error("Error in getTotalSalesOverTime:", error);
    throw error;
  }
}

module.exports = { getTotalSalesOverTime };
