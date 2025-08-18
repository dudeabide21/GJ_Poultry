// "use client";

// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import axios from "axios";
// import { Scale, Sigma, Hash } from "lucide-react";

// export default function AverageWeightDashboard() {
//   const [averages, setAverages] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await axios.get(`${API_URL}/api/average-weights`);
//         setAverages(response.data);
//       } catch (error) {
//         console.error("Failed to fetch average weights:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//     const interval = setInterval(fetchData, 4000); // Refresh every minute
//     return () => clearInterval(interval);
//   }, [API_URL]);

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
//   };
//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 20, transition: { type: "spring" } },
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 lg:p-8">
//       <div className="max-w-screen-xl mx-auto">
//         <header className="mb-8">
//           <h1 className="text-3xl lg:text-4xl font-bold">
//             Chicken Weight Analysis
//           </h1>
//           <p className="text-gray-400">Live average weights by category</p>
//         </header>

//         {isLoading ? (
//           <p className="animate-pulse">Loading average weight data...</p>
//         ) : (
//           <motion.div
//             variants={containerVariants}
//             initial="hidden"
//             animate="visible"
//             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
//           >
//             {averages.length > 0 ? (
//               averages.map((cat) => (
//                 <motion.div
//                   key={cat.category_key}
//                   variants={itemVariants}
//                   className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6"
//                 >
//                   <div className="flex justify-between items-center text-gray-400">
//                     <h2 className="font-bold text-lg text-white">
//                       {cat.category_key}
//                     </h2>
//                     <Scale size={20} />
//                   </div>
//                   <div className="mt-6 space-y-4">
//                     <div className="flex items-center gap-4">
//                       <Sigma className="text-[#D4AF37]" size={24} />
//                       <div>
//                         <p className="text-sm text-gray-400">Average Weight</p>
//                         <p className="text-2xl font-semibold text-white">
//                           {parseFloat(cat.average_weight).toFixed(1)} g
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-4">
//                       <Hash className="text-sky-400" size={24} />
//                       <div>
//                         <p className="text-sm text-gray-400">Chicken Count</p>
//                         <p className="text-2xl font-semibold text-white">
//                           {cat.chicken_count}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))
//             ) : (
//               <p>No weight data available yet.</p>
//             )}
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// }

// // |=============================================|
// // |      UPGRADED FRONTEND: page.js (Next.js)   |
// // |=============================================|

// "use client";

// import { useState, useEffect, useRef } from "react";
// import { motion } from "framer-motion";
// import axios from "axios";
// import { Scale, Sigma, Hash, Wifi, WifiOff } from "lucide-react";

// // Enum for connection status
// const ConnectionStatus = {
//   CONNECTING: "CONNECTING",
//   CONNECTED: "CONNECTED",
//   DISCONNECTED: "DISCONNECTED",
// };

// export default function AverageWeightDashboard() {
//   const [averages, setAverages] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [status, setStatus] = useState(ConnectionStatus.CONNECTING);

//   // Use a ref to hold the WebSocket object to prevent re-renders from creating new instances
//   const ws = useRef(null);
//   // Ref to track if a reconnection attempt is already scheduled
//   const reconnectTimeout = useRef(null);

//   const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

//   useEffect(() => {
//     // Fetch the initial data on component mount
//     const fetchInitialData = async () => {
//       try {
//         const response = await axios.get(`${API_URL}/api/average-weights`);
//         setAverages(response.data);
//       } catch (error) {
//         console.error("Failed to fetch initial average weights:", error);
//         setStatus(ConnectionStatus.DISCONNECTED); // If initial fetch fails, we're disconnected
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchInitialData();

//     // Function to establish and manage WebSocket connection
//     const connectWebSocket = () => {
//       // Use ws:// for http and wss:// for https
//       const wsUrl = API_URL.replace(/^http/, 'ws');
//       ws.current = new WebSocket(wsUrl);
//       setStatus(ConnectionStatus.CONNECTING);

//       ws.current.onopen = () => {
//         console.log("WebSocket Connected");
//         setStatus(ConnectionStatus.CONNECTED);
//         // Clear any scheduled reconnection attempts on successful connection
//         if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
//       };

//       ws.current.onmessage = (event) => {
//         const message = JSON.parse(event.data);
//         if (message.type === 'WEIGHT_UPDATE') {
//           console.log("Received live weight update!");
//           // Use a functional update to ensure smooth animation
//           setAverages(message.payload);
//         }
//       };

//       ws.current.onerror = (error) => {
//         console.error("WebSocket Error:", error);
//         // An error will likely be followed by a close event, which handles reconnection
//       };

//       ws.current.onclose = () => {
//         console.log("WebSocket Disconnected. Attempting to reconnect in 5 seconds...");
//         setStatus(ConnectionStatus.DISCONNECTED);

//         // Schedule a reconnection attempt, ensuring we don't schedule multiple
//         if (!reconnectTimeout.current) {
//           reconnectTimeout.current = setTimeout(() => {
//             reconnectTimeout.current = null; // Clear the ref before retrying
//             connectWebSocket();
//           }, 5000); // 5-second delay
//         }
//       };
//     }

//     connectWebSocket();

//     // Cleanup function: close the connection and clear timeouts when the component unmounts
//     return () => {
//       if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
//       if (ws.current) {
//         ws.current.close();
//       }
//     };
//   }, [API_URL]); // Dependency array ensures this runs only once

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
//   };
//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0, transition: { type: "spring" } }, // Corrected y from 20 to 0
//   };

//   const StatusIndicator = () => {
//     if (status === ConnectionStatus.CONNECTED) {
//       return <div className="flex items-center gap-2 text-green-400"><Wifi size={16} /><span>Live</span></div>;
//     }
//     if (status === ConnectionStatus.CONNECTING) {
//       return <div className="flex items-center gap-2 text-yellow-400 animate-pulse"><Wifi size={16} /><span>Connecting...</span></div>;
//     }
//     return <div className="flex items-center gap-2 text-red-500"><WifiOff size={16} /><span>Disconnected</span></div>;
//   }

//   return (
//     <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 lg:p-8">
//       <div className="max-w-screen-xl mx-auto">
//         <header className="mb-8 flex justify-between items-start">
//           <div>
//             <h1 className="text-3xl lg:text-4xl font-bold">
//               Chicken Weight Analysis
//             </h1>
//             <p className="text-gray-400">Live average weights by category</p>
//           </div>
//           <div className="bg-gray-800/50 rounded-lg px-3 py-2 text-sm font-medium">
//             <StatusIndicator />
//           </div>
//         </header>

//         {isLoading ? (
//           <p className="animate-pulse">Loading initial weight data...</p>
//         ) : (
//           <motion.div
//             variants={containerVariants}
//             initial="hidden"
//             animate="visible"
//             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
//           >
//             {averages.length > 0 ? (
//               averages.map((cat) => (
//                 <motion.div
//                   key={cat.category_key}
//                   variants={itemVariants}
//                   layout // Animate layout changes smoothly when data updates
//                   className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6"
//                 >
//                   <div className="flex justify-between items-center text-gray-400">
//                     <h2 className="font-bold text-lg text-white">
//                       {cat.category_key}
//                     </h2>
//                     <Scale size={20} />
//                   </div>
//                   <div className="mt-6 space-y-4">
//                     <div className="flex items-center gap-4">
//                       <Sigma className="text-[#D4AF37]" size={24} />
//                       <div>
//                         <p className="text-sm text-gray-400">Average Weight</p>
//                         <p className="text-2xl font-semibold text-white">
//                           {/* Handle case where a category has 0 chickens yet */}
//                           {cat.average_weight ? parseFloat(cat.average_weight).toFixed(1) : '0.0'} g
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-4">
//                       <Hash className="text-sky-400" size={24} />
//                       <div>
//                         <p className="text-sm text-gray-400">Chicken Count</p>
//                         <p className="text-2xl font-semibold text-white">
//                           {cat.chicken_count}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))
//             ) : (
//               <p>No weight data available yet. Waiting for live data...</p>
//             )}
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// }

// |=============================================|
// |      FINAL FRONTEND: page.js (Next.js)      |
// |=============================================|

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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/average-weights`);
        setAverages(response.data);
      } catch (error) {
        console.error("Failed to fetch initial average weights:", error);
        setStatus(ConnectionStatus.DISCONNECTED);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();

    const connectWebSocket = () => {
      const wsUrl = API_URL.replace(/^http/, "ws");
      ws.current = new WebSocket(wsUrl);
      setStatus(ConnectionStatus.CONNECTING);

      ws.current.onopen = () => {
        console.log("WebSocket Connected");
        setStatus(ConnectionStatus.CONNECTED);
        if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      };

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "WEIGHT_UPDATE") {
          console.log("Received live weight update!");
          setAverages(message.payload);
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };

      ws.current.onclose = () => {
        console.log(
          "WebSocket Disconnected. Attempting to reconnect in 5 seconds..."
        );
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
    if (status === ConnectionStatus.CONNECTED) {
      return (
        <div className="flex items-center gap-2 text-green-400">
          <Wifi size={16} />
          <span>Live</span>
        </div>
      );
    }
    if (status === ConnectionStatus.CONNECTING) {
      return (
        <div className="flex items-center gap-2 text-yellow-400 animate-pulse">
          <Wifi size={16} />
          <span>Connecting...</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-red-500">
        <WifiOff size={16} />
        <span>Disconnected</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-xl mx-auto">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold">
              GJ <span className="text-sky-400">FARM</span>
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
