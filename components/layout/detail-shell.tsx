"use client"

import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"

export interface DetailShellProps {
	listHref: string
	listLabel: string
	pageTitle: string
	subtitle?: React.ReactNode
	actions?: React.ReactNode
	children: React.ReactNode
	className?: string
}

export function DetailShell({
	listHref,
	listLabel,
	pageTitle,
	subtitle,
	actions,
	children,
	className,
}: DetailShellProps) {
	return (
		<div className={cn("space-y-6", className)}>
			<div className="space-y-4">
				<Button variant="ghost" size="sm" className="-ml-2 gap-1.5 text-muted-foreground hover:text-foreground" asChild>
					<Link href={listHref}>
						<ChevronLeft className="h-4 w-4" />
						Back to {listLabel}
					</Link>
				</Button>
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link href={listHref}>{listLabel}</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage className="font-medium truncate max-w-[200px] sm:max-w-md">
								{pageTitle}
							</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</div>
			<header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="min-w-0 flex-1">
					<h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{pageTitle}</h1>
					{subtitle && <div className="text-muted-foreground text-sm mt-0.5">{subtitle}</div>}
				</div>
				{actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
			</header>
			<div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
				<div className="p-4 sm:p-6 overflow-x-auto">{children}</div>
			</div>
		</div>
	)
}
