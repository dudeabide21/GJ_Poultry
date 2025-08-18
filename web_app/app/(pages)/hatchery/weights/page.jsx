"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function HatcheryWeightsPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/hatchery/weight`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch hatchery weight data:", err);
        setError("Could not load weight data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [API_URL]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <p className="animate-pulse">Loading weight data…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }
  if (!data.length) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        No weight data available yet.
      </div>
    );
  }

  // Compute stats
  const latest = data[data.length - 1];
  const count = data.length;
  const average = data.reduce((sum, entry) => sum + entry.weight, 0) / count;

  // Prepare chart data
  const chartData = data.map((entry) => ({
    ...entry,
    time: new Date(entry.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Hatchery Weights</h1>
        <p className="text-gray-400">Live egg‐weighing data</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-lg text-gray-300">Latest Weight</h3>
          <p className="text-4xl font-bold">{latest.weight.toFixed(1)} g</p>
          <p className="text-gray-400 mt-1">
            {new Date(latest.timestamp).toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-lg text-gray-300">Average Weight</h3>
          <p className="text-4xl font-bold">{average.toFixed(1)} g</p>
          <p className="text-gray-400 mt-1">over {count} entries</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-lg text-gray-300">Total Entries</h3>
          <p className="text-4xl font-bold">{count}</p>
          <p className="text-gray-400 mt-1">
            showing last {count > 100 ? 100 : count}
          </p>
        </motion.div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg text-gray-300 mb-4">Weight History</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
            <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31,41,55,0.8)",
                borderColor: "#4b5563",
                color: "#fff",
              }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#facc15"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
