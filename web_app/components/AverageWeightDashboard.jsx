"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Scale, Sigma, Hash, Wifi, WifiOff } from "lucide-react";

const ConnectionStatus = {
  CONNECTING: "CONNECTING",
  CONNECTED: "CONNECTED",
  DISCONNECTED: "DISCONNECTED",
};

export default function AverageWeightDashboard() {
  const [averages, setAverages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState(ConnectionStatus.CONNECTING);

  const ws = useRef(null);
  const reconnectTimeout = useRef(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Initial fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/average-weights`);
        setAverages(response.data);
        setStatus(ConnectionStatus.CONNECTED);
      } catch (err) {
        console.error("Failed to fetch initial weights:", err);
        setStatus(ConnectionStatus.DISCONNECTED);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();

    // WebSocket for live updates
    const connectWebSocket = () => {
      const wsUrl = API_URL.replace(/^http/, "ws");
      ws.current = new WebSocket(wsUrl);
      setStatus(ConnectionStatus.CONNECTING);

      ws.current.onopen = () => {
        setStatus(ConnectionStatus.CONNECTED);
        if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      };

      ws.current.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "WEIGHT_UPDATE") {
          setAverages(msg.payload);
        }
      };

      ws.current.onerror = () => {
        // Errors trigger onclose next
      };

      ws.current.onclose = () => {
        setStatus(ConnectionStatus.DISCONNECTED);
        if (!reconnectTimeout.current) {
          reconnectTimeout.current = setTimeout(() => {
            reconnectTimeout.current = null;
            connectWebSocket();
          }, 5000);
        }
      };
    };
    connectWebSocket();

    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (ws.current) ws.current.close();
    };
  }, [API_URL]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" } },
  };

  const StatusIndicator = () => {
    if (status === ConnectionStatus.CONNECTED)
      return (
        <div className="flex items-center gap-2 text-green-400">
          <Wifi size={16} /> Live
        </div>
      );
    if (status === ConnectionStatus.CONNECTING)
      return (
        <div className="flex items-center gap-2 text-yellow-400 animate-pulse">
          <Wifi size={16} /> Connecting...
        </div>
      );
    return (
      <div className="flex items-center gap-2 text-red-500">
        <WifiOff size={16} /> Disconnected
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-xl mx-auto">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold">
              Chicken Weight Analysis
            </h1>
            <p className="text-gray-400">Live average weights by category</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg px-3 py-2 text-sm font-medium">
            <StatusIndicator />
          </div>
        </header>

        {isLoading ? (
          <p className="animate-pulse">Loading initial weight data...</p>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {averages.length > 0 ? (
              averages.map((cat) => (
                <motion.div
                  key={cat.category_key}
                  variants={itemVariants}
                  layout
                  className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                >
                  <div className="flex justify-between items-center text-gray-400">
                    <h2 className="font-bold text-lg text-white">
                      {cat.category_key}
                    </h2>
                    <Scale size={20} />
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <Sigma className="text-[#D4AF37]" size={24} />
                      <div>
                        <p className="text-sm text-gray-400">Average Weight</p>
                        <p className="text-2xl font-semibold text-white">
                          {cat.average_weight
                            ? parseFloat(cat.average_weight).toFixed(1)
                            : "0.0"}{" "}
                          g
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Hash className="text-sky-400" size={24} />
                      <div>
                        <p className="text-sm text-gray-400">Chicken Count</p>
                        <p className="text-2xl font-semibold text-white">
                          {cat.chicken_count}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <p>No weight data available yet. Waiting for live data...</p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
