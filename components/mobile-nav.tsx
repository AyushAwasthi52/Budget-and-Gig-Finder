"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Search, Briefcase, User, Users, Settings } from "lucide-react"

type TabType = "overview" | "gigs" | "browse" | "jobs" | "applicants" | "profile"

interface MobileNavProps {
  userRole: string
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
}

export function MobileNav({ userRole, activeTab, setActiveTab }: MobileNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex h-16 items-center justify-around px-4">
        {userRole === "student" ? (
          <>
            <Button
              variant={activeTab === "gigs" ? "default" : "ghost"}
              size="icon"
              className="flex flex-col items-center gap-1"
              onClick={() => handleTabChange("gigs")}
            >
              <Search className="h-5 w-5" />
              <span className="text-xs">Gigs</span>
            </Button>
            <Button
              variant={activeTab === "profile" ? "default" : "ghost"}
              size="icon"
              className="flex flex-col items-center gap-1"
              onClick={() => handleTabChange("profile")}
            >
              <User className="h-5 w-5" />
              <span className="text-xs">Profile</span>
            </Button>
          </>
        ) : (
          <>
            <Button
              variant={activeTab === "browse" ? "default" : "ghost"}
              size="icon"
              className="flex flex-col items-center gap-1"
              onClick={() => handleTabChange("browse")}
            >
              <Search className="h-5 w-5" />
              <span className="text-xs">Browse</span>
            </Button>
            <Button
              variant={activeTab === "jobs" ? "default" : "ghost"}
              size="icon"
              className="flex flex-col items-center gap-1"
              onClick={() => handleTabChange("jobs")}
            >
              <Briefcase className="h-5 w-5" />
              <span className="text-xs">Jobs</span>
            </Button>
            <Button
              variant={activeTab === "applicants" ? "default" : "ghost"}
              size="icon"
              className="flex flex-col items-center gap-1"
              onClick={() => handleTabChange("applicants")}
            >
              <Users className="h-5 w-5" />
              <span className="text-xs">Applicants</span>
            </Button>
            <Button
              variant={activeTab === "profile" ? "default" : "ghost"}
              size="icon"
              className="flex flex-col items-center gap-1"
              onClick={() => handleTabChange("profile")}
            >
              <User className="h-5 w-5" />
              <span className="text-xs">Profile</span>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

