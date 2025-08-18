// components/HatcheryDashboard.jsx
"use client";

import { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { Thermometer, Droplets, RotateCcw } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

// ─────────────────────────────────────────────────────────────────────────────
// StatCard: animating numeric card (used for temp, humidity, trolley tilt)
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ icon, title, value, unit, color }) {
  const isDataAvailable = value !== null && value !== undefined;
  const displayValue = isDataAvailable ? value : 0;

  const count = useMotionValue(displayValue);
  const rounded = useTransform(count, (latest) =>
    latest.toFixed(unit === "%RH" ? 0 : 1)
  );

  useEffect(() => {
    const animation = animate(count, displayValue, { duration: 1 });
    return animation.stop;
  }, [displayValue, count]);

  return (
    <div className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col justify-between h-full">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-300">{title}</h3>
        <div style={{ color }}>{icon}</div>
      </div>
      <div className="mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={displayValue}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {isDataAvailable ? (
              <p className="text-4xl lg:text-5xl font-bold text-white flex items-baseline">
                <motion.span>{rounded}</motion.span>
                <span className="text-2xl text-gray-400 ml-2">{unit}</span>
              </p>
            ) : (
              <p className="text-4xl lg:text-5xl font-bold text-gray-500">--</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HistoryChart: line chart for a single key
// ─────────────────────────────────────────────────────────────────────────────
function HistoryChart({ data, dataKey, name, color }) {
  const formatted = data.map((d) => ({
    ...d,
    time: new Date(d.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  return (
    <div className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6">
      <h3 className="text-lg font-medium text-gray-300 mb-4">{name} History</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={formatted}
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
            dataKey={dataKey}
            name={name}
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HatcheryDashboard: main component
// ─────────────────────────────────────────────────────────────────────────────
export default function HatcheryDashboard() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/hatchery`);
        setHistory(data);
      } catch (err) {
        console.error("Failed to fetch hatchery data:", err);
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
        <p className="animate-pulse">Loading Hatchery Dashboard...</p>
      </div>
    );
  }
  if (!history.length) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <p>No hatchery data available yet.</p>
      </div>
    );
  }

  const latest = history[history.length - 1];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-2xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold">
              GJ <span className="text-emerald-400">HATCHERY</span>
            </h1>
            <p className="text-gray-400">Live hatchery data overview</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-6">
          <StatCard
            icon={<Thermometer />}
            title="Temperature"
            value={latest.temperature}
            unit="°C"
            color="#f87171"
          />
          <StatCard
            icon={<Droplets />}
            title="Humidity"
            value={latest.humidity}
            unit="%RH"
            color="#38bdf8"
          />
          {latest.trolleys.map((tilt, i) => (
            <StatCard
              key={i}
              icon={<RotateCcw />}
              title={`Trolley ${i + 1}`}
              value={tilt}
              unit="°"
              color="#f472b6"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 mt-6 border-t border-white/10">
          <HistoryChart
            data={history}
            dataKey="temperature"
            name="Temperature"
            color="#f87171"
          />
          <HistoryChart
            data={history}
            dataKey="humidity"
            name="Humidity"
            color="#38bdf8"
          />
        </div>

        <footer className="text-center mt-12 py-6 border-t border-white/10 text-gray-500">
          Created by Team ARC for GJ Hatchery Automation
        </footer>
      </div>
    </div>
  );
}
