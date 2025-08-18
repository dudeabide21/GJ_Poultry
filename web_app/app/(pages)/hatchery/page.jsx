// File: app/hatchery/page.jsx
"use client";
import Link from "next/link";

export default function HatcheryHome() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">GJ Hatchery</h1>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl">
        <Link
          href="/hatchery/sensors"
          className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:scale-105 transition"
        >
          <h2 className="text-2xl font-semibold">Sensor Data</h2>
          <p className="text-gray-400">Temperature, Humidity & Trolley Tilts</p>
        </Link>
        <Link
          href="/hatchery/weights"
          className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:scale-105 transition"
        >
          <h2 className="text-2xl font-semibold">Weight Data</h2>
          <p className="text-gray-400">(Coming Soon)</p>
        </Link>
      </div>
    </div>
  );
}
