"use client"

import Link from "next/link"
import { Home, PieChart, Briefcase, User } from "lucide-react"
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

interface MobileNavProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function MobileNav({ activeTab, setActiveTab }: MobileNavProps) {
  return (
    <div className="sticky bottom-0 z-10 flex h-16 items-center justify-around border-t bg-white">
      <button
        onClick={() => setActiveTab("overview")}
        className={`flex flex-1 flex-col items-center justify-center py-2 ${
          activeTab === "overview" ? "text-purple-600" : "text-gray-500"
        }`}
      >
        <Home className="h-5 w-5" />
        <span className="text-xs">Home</span>
      </button>

      <Link href="/budget" className="flex flex-1 flex-col items-center justify-center py-2 text-gray-500">
        <PieChart className="h-5 w-5" />
        <span className="text-xs">Budget</span>
      </Link>

      <button
        onClick={() => setActiveTab("gigs")}
        className={`flex flex-1 flex-col items-center justify-center py-2 ${
          activeTab === "gigs" ? "text-purple-600" : "text-gray-500"
        }`}
      >
        <Briefcase className="h-5 w-5" />
        <span className="text-xs">Gigs</span>
      </button>

      <Link href="/profile" className="flex flex-1 flex-col items-center justify-center py-2 text-gray-500">
        <User className="h-5 w-5" />
        <span className="text-xs">Profile</span>
      </Link>
    </div>
  )
}

