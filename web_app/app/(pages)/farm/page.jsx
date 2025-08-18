// File: app/farm/page.jsx
"use client";
import Link from "next/link";

export default function FarmHome() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">GJ Farm</h1>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl">
        <Link
          href="/farm/sensors"
          className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:scale-105 transition"
        >
          <h2 className="text-2xl font-semibold">Sensor Data</h2>
          <p className="text-gray-400">
            Live Temperature, Humidity, CO₂, Light & Ammonia
          </p>
        </Link>
        <Link
          href="/farm/weights"
          className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:scale-105 transition"
        >
          <h2 className="text-2xl font-semibold">Weight Analysis</h2>
          <p className="text-gray-400">Average Chicken Weights by Category</p>
        </Link>
      </div>
    </div>
  );
}
