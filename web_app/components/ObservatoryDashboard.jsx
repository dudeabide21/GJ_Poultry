"use client";

import { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { Thermometer, Droplets, Wind, Weight, Sun, Cloud } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import axios from "axios";

function StatCard({ icon, title, value, unit, color }) {
  const isDataAvailable = value !== null && typeof value !== "undefined";
  const displayValue = isDataAvailable ? value : 0;
  const count = useMotionValue(displayValue);
  const rounded = useTransform(count, (latest) => latest.toFixed(1));

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
            key={value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {isDataAvailable ? (
              <p className="text-4xl lg:text-5xl font-bold text-white">
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

function HumidityGauge({ value, icon, color }) {
  const humidity = value || 0;
  const count = useMotionValue(humidity);
  const rounded = useTransform(count, (latest) => latest.toFixed(0));

  useEffect(() => {
    const animation = animate(count, humidity, {
      duration: 1.5,
      ease: "easeOut",
    });
    return animation.stop;
  }, [humidity, count]);

  return (
    <div className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center col-span-1 md:col-span-2 lg:col-span-1">
      <div className="w-full flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-300">Humidity</h3>
        {icon && <div style={{ color }}>{icon}</div>}
      </div>
      <div className="relative w-40 h-40">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#374151"
            strokeWidth="8"
            fill="transparent"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            stroke="url(#humidityGradient)"
            strokeWidth="8"
            fill="transparent"
            strokeLinecap="round"
            pathLength={1}
            initial={{ strokeDasharray: "1", strokeDashoffset: 1 }}
            animate={{ strokeDashoffset: 1 - humidity / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <defs>
            <linearGradient
              id="humidityGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span className="text-4xl font-bold text-white">
            {rounded}
          </motion.span>
          <span className="text-xl text-sky-400">%</span>
        </div>
      </div>
    </div>
  );
}

function HistoryChart({ data, dataKey, name, color }) {
  const formattedData = data.map((d) => ({
    ...d,
    time: new Date(d.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));
  return (
    <div className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 col-span-1 md:col-span-2 lg:col-span-4 xl:col-span-5">
      <h3 className="text-lg font-medium text-gray-300 mb-4">
        {name} History (Last 50 Readings)
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={formattedData}
          margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
          <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            domain={["dataMin - 5", "dataMax + 5"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(31, 41, 55, 0.8)",
              borderColor: "#4b5563",
              color: "#ffffff",
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

export default function ObservatoryDashboard() {
  const [data, setData] = useState({ latest: null, history: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/dashboard-data`);
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Could not connect to sensor API.");
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
        <p className="animate-pulse">Loading Dashboard...</p>
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
  if (!data.latest) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Awaiting first sensor reading...
      </div>
    );
  }

  const isOnline = Date.now() - new Date(data.latest.timestamp) < 90000;

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-2xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold">
              GJ <span className="text-sky-400">FARM</span>
            </h1>
            <p className="text-gray-400">
              Live data from your automation project
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span
                className={`absolute inline-flex h-full w-full rounded-full ${
                  isOnline ? "bg-green-400 animate-ping" : "bg-red-500"
                } opacity-75`}
              />
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isOnline ? "bg-green-500" : "bg-red-500"
                }`}
              />
            </span>
            <span className={isOnline ? "text-green-400" : "text-red-500"}>
              {isOnline ? "LIVE" : "OFFLINE"}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <StatCard
            icon={<Thermometer />}
            title="Temperature"
            value={data.latest.temperature}
            unit="°C"
            color="#f87171"
          />
          <HumidityGauge
            value={data.latest.humidity}
            icon={<Droplets />}
            color="#38bdf8"
          />
          <StatCard
            icon={<Cloud />}
            title="CO₂"
            value={data.latest.co2_ppm}
            unit="ppm"
            color="#a78bfa"
          />
          <StatCard
            icon={<Sun />}
            title="Light"
            value={data.latest.lux}
            unit="lux"
            color="#facc15"
          />
          <StatCard
            icon={<Wind />}
            title="Ammonia"
            value={data.latest.nh3}
            unit="ppm"
            color="#34d399"
          />

          <Link href="/farm/weights" className="group rounded-2xl block h-full">
            <div className="h-full group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-orange-500/20 transition-all duration-300">
              <StatCard
                icon={<Weight />}
                title="Weight Analysis"
                value={data.latest.weight}
                unit="g"
                color="#fb923c"
              />
            </div>
          </Link>

          <div className="md:col-span-2 lg:col-span-4 xl:col-span-5 pt-6 mt-6 border-t border-white/10">
            <HistoryChart
              data={data.history}
              dataKey="temperature"
              name="Temperature"
              color="#f87171"
            />
          </div>
          <div className="md:col-span-2 lg:col-span-4 xl:col-span-5 pt-6 mt-6 border-t border-white/10">
            <HistoryChart
              data={data.history}
              dataKey="co2_ppm"
              name="CO₂"
              color="#a78bfa"
            />
          </div>
          <div className="md:col-span-2 lg:col-span-4 xl:col-span-5 pt-6 mt-6 border-t border-white/10">
            <HistoryChart
              data={data.history}
              dataKey="humidity"
              name="Humidity"
              color="#38bdf8"
            />
          </div>
        </div>

        <footer className="text-center mt-12 py-6 border-t border-white/10 text-gray-500">
          Created by Team ARC for GJ Farm Automation
        </footer>
      </div>
    </div>
  );
}
