"use client";

import { useState } from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import Link from "next/link";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: "Gestion des cartes", path: "/admin/cards" },
    { label: "Gestion des utilisateurs", path: "/admin/users" },
    { label: "Statistiques", path: "/admin/statistics" },
    { label: "Gestion des règles", path: "/admin/rules" },
  ];

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "block" : "hidden"
        } md:block fixed inset-y-0 md:static z-10 w-64 bg-white shadow-md md:translate-x-0 transform transition-transform duration-300`}
      >
        <div className="p-6">
          {/* Back to Dashboard Button */}
          <div className="mb-4">
            <Link
              href="/admin"
              className="block w-full text-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
            >
              Retour au Dashboard
            </Link>
          </div>

          <h2 className="text-lg font-semibold text-gray-900">Back Office</h2>
          <nav className="mt-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className="block w-full text-left px-4 py-2 rounded text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Burger button for mobile */}
      <button
        className="block md:hidden p-2 rounded-full text-gray-500 hover:bg-gray-200 fixed top-4 left-4 z-20"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bars3Icon className="h-6 w-6" />
      </button>
    </>
  );
};

export default Sidebar;
