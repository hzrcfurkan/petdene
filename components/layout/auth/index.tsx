"use client"

import type { ReactNode } from "react"
import { Logo } from "@/components/shared/Logo"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { cn } from "@/lib/utils"

interface LayoutAuthProps {
  children: ReactNode
  className?: string
}

export default function LayoutAuth({ children, className }: LayoutAuthProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95 flex flex-col">
      <header className="px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
        <Logo href="/" />
        <ThemeToggle variant="switch" />
      </header>
      <main className={cn("flex-1 flex items-center justify-center px-4 py-8 sm:px-6", className)}>
        <div className="w-full max-w-lg">{children}</div>
      </main>
    </div>
  )
}
