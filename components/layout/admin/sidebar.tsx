"use client"

import { Logo } from "@/components/shared/Logo"
import { currentUserClient, getRoleLabel } from "@/lib/auth/client"
import { cn } from "@/lib/utils"
import { LogOut, Menu, X, ChevronRight } from "lucide-react"
import { signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { getNavItems } from "./sidebar-items"
import Link from "next/link"

export default function Sidebar() {
	const currentUser = currentUserClient()
	const [isOpen, setIsOpen] = useState(false)
	const [isMobile, setIsMobile] = useState(false)
	const pathname = usePathname()

	useEffect(() => {
		const check = () => {
			setIsMobile(window.innerWidth < 1024)
			if (window.innerWidth >= 1024) setIsOpen(false)
		}
		check()
		window.addEventListener("resize", check)
		return () => window.removeEventListener("resize", check)
	}, [])

	if (!currentUser) return null

	const userRole = currentUser.role
	const dashLink = userRole === "Süper Admin" ? "/super" : userRole === "Admin" ? "/admin" : userRole === "Personel" ? "/staff" : "/customer"
	const navItems = getNavItems(userRole || "Müşteri")
	const initials = (currentUser.name || currentUser.email || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)

	const SidebarContent = () => (
		<div className="sb-inner">
			{/* Logo area */}
			<div className="sb-logo-area">
				<Link href={dashLink} className="sb-logo-link">
					<div className="sb-logo-icon">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
							<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
							<path d="M8 14s1.5 2 4 2 4-2 4-2"/>
							<line x1="9" y1="9" x2="9.01" y2="9"/>
							<line x1="15" y1="9" x2="15.01" y2="9"/>
						</svg>
					</div>
					<div>
						<p className="sb-logo-name">PetCare</p>
						<p className="sb-logo-role">{getRoleLabel(userRole || "Müşteri")}</p>
					</div>
				</Link>
				{isMobile && (
					<button className="sb-close-btn" onClick={() => setIsOpen(false)}>
						<X className="w-4 h-4" />
					</button>
				)}
			</div>

			{/* Nav */}
			<nav className="sb-nav">
				<p className="sb-nav-label">Menü</p>
				{navItems.map((item) => {
					const Icon = item.icon
					const active = pathname === item.href || pathname.startsWith(item.href + "/")
					return (
						<Link
							key={item.href}
							href={item.href}
							onClick={() => isMobile && setIsOpen(false)}
							className={cn("sb-nav-item", active && "sb-nav-active")}
						>
							<Icon className="sb-nav-icon" />
							<span className="sb-nav-label-text">{item.label}</span>
							{active && <ChevronRight className="sb-nav-chevron" />}
						</Link>
					)
				})}
			</nav>

			{/* User footer */}
			<div className="sb-footer">
				<div className="sb-user">
					<div className="sb-user-avatar">{initials}</div>
					<div className="sb-user-info">
						<p className="sb-user-name">{currentUser.name || "Kullanıcı"}</p>
						<p className="sb-user-email">{currentUser.email}</p>
					</div>
				</div>
				<button
					className="sb-logout"
					onClick={async () => { await signOut({ callbackUrl: "/", redirect: true }) }}
				>
					<LogOut className="w-4 h-4" />
					<span>Çıkış Yap</span>
				</button>
			</div>
		</div>
	)

	return (
		<>
			{isMobile && (
				<button
					className="sb-mobile-toggle"
					onClick={() => setIsOpen(!isOpen)}
					aria-label="Menüyü Aç"
				>
					<Menu className="h-5 w-5" />
				</button>
			)}

			<aside className={cn("sb-aside", isMobile && (isOpen ? "sb-open" : "sb-closed"))}>
				<SidebarContent />
			</aside>

			{isMobile && isOpen && (
				<div className="sb-overlay" onClick={() => setIsOpen(false)} />
			)}
		</>
	)
}
