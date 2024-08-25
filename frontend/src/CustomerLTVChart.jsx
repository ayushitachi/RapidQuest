import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CustomerLTVChart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_PATH}/api/customer-ltv`);
            const ltvData = await response.json();

            // Ensure data formatting is consistent with the new API response
            const formattedData = ltvData.map(item => ({
                cohort: item.month,  // Accessing month from the new structure
                averageLTV: parseFloat(item.averageRevenue.toFixed(2)),  // Changed to averageRevenue
                customerCount: item.customerCount  // Kept as is
            }));

            setData(formattedData);
        } catch (error) {
            console.error('Error fetching customer LTV data:', error);
        }
    };

    const formatYAxis = (tickItem) => {
        return `$${tickItem.toLocaleString()}`;
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip" style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc' }}>
                    <p className="label">{`Cohort: ${label}`}</p>
                    <p className="info">{`Average LTV: $${payload[0].value.toLocaleString()}`}</p>
                    <p className="info">{`Customer Count: ${payload[1].value}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cohort" />
                <YAxis yAxisId="left" tickFormatter={formatYAxis} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="averageLTV" fill="#8884d8" name="Average LTV" />
                <Bar yAxisId="right" dataKey="customerCount" fill="#82ca9d" name="Customer Count" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default CustomerLTVChart;
