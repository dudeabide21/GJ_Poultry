// File: app/page.jsx
"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <Link
          href="/farm"
          className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center hover:scale-105 transition"
        >
          <h2 className="text-2xl font-bold text-white mb-2">Farm Dashboard</h2>
          <p className="text-gray-400">
            Temperature, Humidity, CO₂, Light & Weights
          </p>
        </Link>
        <Link
          href="/hatchery"
          className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center hover:scale-105 transition"
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            Hatchery Dashboard
          </h2>
          <p className="text-gray-400">Temperature, Humidity & Trolley Tilts</p>
        </Link>
      </div>
    </div>
  );
}
