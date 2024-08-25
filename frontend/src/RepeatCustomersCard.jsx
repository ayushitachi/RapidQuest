import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RepeatCustomersCard = () => {
    const [data, setData] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_PATH}/api/repeat-customers`);
            const repeatCustomersData = await response.json();
            setData(repeatCustomersData);
        } catch (error) {
            console.error('Error fetching repeat customers data:', error);
        }
    };

    const chartData = [
        { name: 'Daily', value: data.dailyRepeatCustomers },
        { name: 'Monthly', value: data.monthlyRepeatCustomers },
        { name: 'Quarterly', value: data.quarterlyRepeatCustomers },
        { name: 'Yearly', value: data.yearlyRepeatCustomers }
    ];

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                {/* <div className="text-center">
                    <p className="text-sm font-medium">Daily</p>
                    <p className="text-2xl font-bold">{data.dailyRepeatCustomers}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium">Monthly</p>
                    <p className="text-2xl font-bold">{data.monthlyRepeatCustomers}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium">Quarterly</p>
                    <p className="text-2xl font-bold">{data.quarterlyRepeatCustomers}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium">Yearly</p>
                    <p className="text-2xl font-bold">{data.yearlyRepeatCustomers}</p>
                </div> */}
            </div>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RepeatCustomersCard;