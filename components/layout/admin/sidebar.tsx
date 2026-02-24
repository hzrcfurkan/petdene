"use client"

import { Logo } from "@/components/shared/Logo"
import { Button } from "@/components/ui/button"
import { currentUserClient, getRoleLabel } from "@/lib/auth/client"
import { cn } from "@/lib/utils"
import { LogOut, Menu, X } from "lucide-react"
import { signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { getNavItems } from "./sidebar-items"
import { SidebarNavigation } from "./sidebar-navigation"

export default function Sidebar() {
	const currentUser = currentUserClient()
	const [isOpen, setIsOpen] = useState(false)
	const [isMobile, setIsMobile] = useState(false)

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 1024)
			if (window.innerWidth >= 1024) {
				setIsOpen(false)
			}
		}

		checkMobile()
		window.addEventListener("resize", checkMobile)
		return () => window.removeEventListener("resize", checkMobile)
	}, [])

	if (!currentUser) return null

	const userRole = currentUser.role
	const getDashboardLink = () => {
		switch (userRole) {
			case "SUPER_ADMIN":
				return "/admin/super"
			case "ADMIN":
				return "/admin"
			case "STAFF":
				return "/staff"
			case "CUSTOMER":
				return "/customer"
			default:
				return "/customer"
		}
	}

	// Get nav items based on role
	const filteredNavItems = getNavItems(userRole || "CUSTOMER")

	const SidebarContent = () => (
		<div className="flex flex-col h-full">
			{/* Logo */}
			<div className="flex items-center justify-between h-16 px-6 border-b border-border bg-card">
				<Logo href={getDashboardLink()} />
				{isMobile && (
					<Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
						<X className="h-5 w-5" />
					</Button>
				)}
			</div>

			{/* Navigation */}
			<SidebarNavigation
				items={filteredNavItems}
				onItemClick={() => isMobile && setIsOpen(false)}
			/>

			{/* User Info & Logout */}
			<div className="border-t border-border p-4 space-y-3">
				<div className="px-3 py-2.5 rounded-md border border-border bg-muted/30">
					<p className="text-sm font-medium text-foreground">{currentUser.name || "User"}</p>
					<p className="text-xs text-muted-foreground mt-0.5">{getRoleLabel(userRole || "CUSTOMER")}</p>
				</div>
				<Button
					variant="ghost"
					className="w-full justify-start gap-3 text-destructive"
					onClick={async () => {
						await signOut({
							callbackUrl: "/",
							redirect: true,
						})
					}}
				>
					<LogOut className="h-5 w-5" />
					<span>Sign out</span>
				</Button>
			</div>
		</div>
	)

	return (
		<>
			{/* Mobile Toggle Button */}
			{isMobile && (
				<Button
					variant="ghost"
					size="icon"
					className="fixed top-4 left-4 z-50 lg:hidden"
					onClick={() => setIsOpen(!isOpen)}
				>
					<Menu className="h-6 w-6" />
				</Button>
			)}

			{/* Sidebar */}
			<aside
				className={cn(
					"fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card lg:translate-x-0",
					isMobile && (isOpen ? "translate-x-0" : "-translate-x-full")
				)}
			>
				<SidebarContent />
			</aside>

			{/* Overlay for mobile */}
			{isMobile && isOpen && (
				<div
					className="fixed inset-0 z-30 bg-background/80 lg:hidden"
					onClick={() => setIsOpen(false)}
				/>
			)}
		</>
	)
}

