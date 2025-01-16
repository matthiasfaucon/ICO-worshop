"use client";

import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="bg-white py-12 sm:py-6">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-base/7 font-semibold text-indigo-600">ICO GAMES</h2>
        <p className="mt-2 max-w-lg text-pretty text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
          Dashboard
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-5 lg:grid-cols-4 lg:grid-rows-2">
          <Link
            href="admin/rules"
            className="relative group lg:col-span-2 transition-transform duration-300 hover:scale-105"
          >
            <div className="absolute inset-px rounded-lg bg-white lg:rounded-tl-[1.5rem]" />
            <div className="relative flex h-56 flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-tl-[calc(1.5rem+1px)]">
              <div className="p-6 pt-4">
                <p className="text-md font-medium tracking-tight text-gray-950">Gestion des règles du jeu</p>
                <h3 className="text-sm font-semibold text-indigo-600">Gérer</h3>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 lg:rounded-tl-[1.5rem]" />
          </Link>

          <Link
            href="admin/cards"
            className="relative group lg:col-span-2 transition-transform duration-300 hover:scale-105"
          >
            <div className="absolute inset-px rounded-lg bg-white lg:rounded-tr-[1.5rem]" />
            <div className="relative flex h-56 flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-tr-[calc(1.5rem+1px)]">
              <div className="p-6 pt-4">
                <p className="text-md font-medium tracking-tight text-gray-950">Gestion des cartes</p>
                <h3 className="text-sm font-semibold text-indigo-600">Gérer</h3>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 lg:rounded-tr-[1.5rem]" />
          </Link>

          <Link
            href="admin/users"
            className="relative group transition-transform duration-300 hover:scale-105"
          >
            <div className="absolute inset-px rounded-lg bg-white lg:rounded-bl-[1.5rem]" />
            <div className="relative flex h-48 flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-bl-[calc(1.5rem+1px)]">
              <div className="p-4 pt-2">
                <p className="text-sm font-medium tracking-tight text-gray-950">Gestion des utilisateurs</p>
                <h3 className="text-xs font-semibold text-indigo-600">Gérer</h3>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 lg:rounded-bl-[1.5rem]" />
          </Link>

          <Link
            href="admin/statistics"
            className="relative group transition-transform duration-300 hover:scale-105"
          >
            <div className="absolute inset-px rounded-lg bg-white" />
            <div className="relative flex h-48 flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)]">
              <div className="p-4 pt-2">
                <p className="text-sm font-medium tracking-tight text-gray-950">Statistiques sur l’utilisation du jeu</p>
                <h3 className="text-xs font-semibold text-indigo-600">Voir</h3>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5" />
          </Link>

          <Link
            href="admin/bugsSuggestions"
            className="relative group lg:col-span-2 transition-transform duration-300 hover:scale-105"
          >
            <div className="absolute inset-px rounded-lg bg-white lg:rounded-br-[1.5rem]" />
            <div className="relative flex h-56 flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-br-[calc(1.5rem+1px)]">
              <div className="p-6 pt-4">
                <p className="text-md font-medium tracking-tight text-gray-950">Gestion des bugs et des suggestions</p>
                <h3 className="text-sm font-semibold text-indigo-600">Gérer</h3>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 lg:rounded-br-[1.5rem]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
