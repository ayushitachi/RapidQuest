import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TotalSalesChart from "./TotalSalesChart.tsx";
import SalesGrowthChart from "./SalesGrowthChart.tsx";
import NewCustomersChart from "./NewCustomersChart.tsx";
import RepeatCustomersCard from "./RepeatCustomersCard.tsx";
import CustomerDistributionChart from "./CustomerDistributionChart.tsx";
import CustomerLTVChart from "./CustomerLTVChart.tsx";

const Dashboard = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center flex flex-col items-center justify-center">
        Sales Analytics Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Sales Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <TotalSalesChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesGrowthChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New Customers Added</CardTitle>
          </CardHeader>
          <CardContent>
            <NewCustomersChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Repeat Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <RepeatCustomersCard />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geographical Distribution of Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerDistributionChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Lifetime Value by Cohorts</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerLTVChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
