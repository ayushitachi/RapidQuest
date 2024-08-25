import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const NewCustomersChart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_PATH}/api/new-customers`);
            const newCustomersData = await response.json();

            const formattedData = newCustomersData.map(item => ({
                date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
                newCustomers: item.newCustomers
            }));

            setData(formattedData);
        } catch (error) {
            console.error('Error fetching new customers data:', error);
        }
    };

    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="newCustomers" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default NewCustomersChart;