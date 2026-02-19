"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Menu, X, BookOpen, Download, Key, Play, FileText, HelpCircle, Rocket, Code } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

const DOCS_SECTIONS = [
	{
		label: "Prerequisites",
		href: "#prerequisites",
		icon: Download,
	},
	{
		label: "Installation",
		href: "#installation",
		icon: Download,
	},
	{
		label: "Configuration",
		href: "#configuration",
		icon: Key,
	},
	{
		label: "Environment Variables",
		href: "#env-variables",
		icon: Code,
	},
	{
		label: "Running the App",
		href: "#running",
		icon: Play,
	},
	{
		label: "Using the App",
		href: "#using",
		icon: FileText,
	},
	{
		label: "Troubleshooting",
		href: "#troubleshooting",
		icon: HelpCircle,
	},
	{
		label: "Next Steps",
		href: "#next-steps",
		icon: Rocket,
	},
]

export function DocsSidebar() {
	const [isOpen, setIsOpen] = useState(false)
	const [isMobile, setIsMobile] = useState(false)
	const [activeSection, setActiveSection] = useState("")

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

	useEffect(() => {
		const handleScroll = () => {
			const sections = DOCS_SECTIONS.map((section) => {
				const element = document.querySelector(section.href)
				if (element) {
					const rect = element.getBoundingClientRect()
					return {
						id: section.href,
						top: rect.top,
					}
				}
				return null
			}).filter(Boolean) as { id: string; top: number }[]

			const current = sections.find((section) => section.top <= 100 && section.top >= -200)
			if (current) {
				setActiveSection(current.id)
			}
		}

		window.addEventListener("scroll", handleScroll)
		handleScroll() // Initial check
		return () => window.removeEventListener("scroll", handleScroll)
	}, [])

	const handleLinkClick = (href: string) => {
		const element = document.querySelector(href)
		if (element) {
			const offset = 80
			const elementPosition = element.getBoundingClientRect().top
			const offsetPosition = elementPosition + window.pageYOffset - offset

			window.scrollTo({
				top: offsetPosition,
				behavior: "smooth",
			})
		}
		if (isMobile) {
			setIsOpen(false)
		}
	}

	const SidebarContent = () => (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
				<Link href="/docs" className="flex items-center gap-2">
					<BookOpen className="h-5 w-5 text-primary" />
					<span className="font-semibold">Documentation</span>
				</Link>
				{isMobile && (
					<Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
						<X className="h-5 w-5" />
					</Button>
				)}
			</div>

			{/* Navigation */}
			<nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
				{DOCS_SECTIONS.map((section) => {
					const Icon = section.icon
					const isActive = activeSection === section.href
					return (
						<button
							key={section.href}
							onClick={() => handleLinkClick(section.href)}
							className={cn(
								"w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200",
								isActive
									? "bg-primary text-primary-foreground font-medium shadow-sm"
									: "text-foreground/70 hover:bg-muted/50 hover:text-foreground"
							)}
						>
							<Icon className="h-4 w-4 shrink-0" />
							<span className="text-left">{section.label}</span>
						</button>
					)
				})}
			</nav>

			{/* Footer Links */}
			<div className="border-t border-border p-4 space-y-2">
				<Link
					href="/demo"
					className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-foreground/70 hover:bg-muted/50 hover:text-foreground transition-colors"
				>
					<FileText className="h-4 w-4" />
					<span>Demo Page</span>
				</Link>
				<Link
					href="/"
					className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-foreground/70 hover:bg-muted/50 hover:text-foreground transition-colors"
				>
					<BookOpen className="h-4 w-4" />
					<span>Home</span>
				</Link>
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
					className="fixed top-4 left-4 z-50 lg:hidden bg-background/80 backdrop-blur-sm border shadow-sm"
					onClick={() => setIsOpen(!isOpen)}
				>
					<Menu className="h-5 w-5" />
				</Button>
			)}

			{/* Sidebar */}
			<aside
				className={cn(
					"fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card lg:translate-x-0 transition-transform duration-300 overflow-hidden",
					isMobile && (isOpen ? "translate-x-0" : "-translate-x-full")
				)}
				style={{ position: "fixed" }}
			>
				<SidebarContent />
			</aside>

			{/* Overlay for mobile */}
			{isMobile && isOpen && (
				<div
					className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
					onClick={() => setIsOpen(false)}
				/>
			)}
		</>
	)
}

