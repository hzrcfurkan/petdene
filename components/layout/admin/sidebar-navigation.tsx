"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavItem {
	label: string
	href: string
	icon: React.ComponentType<{ className?: string }>
}

interface SidebarNavigationProps {
	items: NavItem[]
	onItemClick?: () => void
}

export function SidebarNavigation({ items, onItemClick }: SidebarNavigationProps) {
	const pathname = usePathname()

	return (
		<nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
			{items.map((item) => {
				const Icon = item.icon
				const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
				return (
					<Link
						key={item.href}
						href={item.href}
						onClick={onItemClick}
						className={cn(
							"w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm",
							isActive
								? "bg-primary text-primary-foreground font-medium"
								: "text-foreground/70 hover:bg-muted/50 hover:text-foreground"
						)}
					>
						<Icon className="h-5 w-5" />
						<span>{item.label}</span>
					</Link>
				)
			})}
		</nav>
	)
}
