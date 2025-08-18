"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Thermometer, Scale } from "lucide-react";
import "./globals.css";

export default function RootLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    {
      section: "Farm",
      links: [
        { href: "/farm/sensors", label: "Sensors", icon: <Thermometer /> },
        { href: "/farm/weights", label: "Weights", icon: <Scale /> },
      ],
    },
    {
      section: "Hatchery",
      links: [
        { href: "/hatchery/sensors", label: "Sensors", icon: <Thermometer /> },
        { href: "/hatchery/weights", label: "Weights", icon: <Scale /> },
      ],
    },
  ];

  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-gray-950 text-white font-sans">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800/70 backdrop-blur-md shadow-lg p-6 transform transition-transform duration-200 ease-in-out
            ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0`}
        >
          {/* Close button (mobile only) */}
          <div className="flex justify-between items-center md:hidden mb-4">
            <h1 className="text-xl font-bold text-white">GJ POULTRY</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          {/* Title (desktop) */}
          <div className="hidden md:block mb-8">
            <h1 className="text-2xl font-bold tracking-wider text-white">
              GJ <span className="text-yellow-400">POULTRY</span>
            </h1>
          </div>

          <nav className="space-y-8">
            {navItems.map(({ section, links }) => (
              <div key={section}>
                <h2 className="text-xs font-semibold text-gray-400 uppercase mb-2 tracking-wide">
                  {section}
                </h2>
                <ul className="space-y-2">
                  {links.map(({ href, label, icon }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 hover:text-yellow-400 transition-all duration-150"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="text-lg">{icon}</span>
                        <span className="text-sm font-medium">{label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Hamburger button (mobile) */}
        <header className="fixed top-4 left-4 z-40 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="bg-gray-800 p-2 rounded-md shadow hover:bg-gray-700 transition"
          >
            <Menu size={24} className="text-white" />
          </button>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto md:pl-64 bg-gray-900 p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
