"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { cn } from "@/lib/utils"
import type React from "react"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={toggleSidebar}
        className="hidden lg:flex"
      />
      <div
        className={cn(
          "flex-1 flex flex-col overflow-hidden transition-all duration-300",
          isSidebarCollapsed ? "lg:ml-[80px]" : "lg:ml-64",
          "ml-0"
        )}
      >
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
