"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Wrapper for tables that enables mobile-responsive card layout.
 * On mobile (<768px): each row displays as a card with label-value pairs.
 * On desktop: normal table layout.
 * Add data-label to each TableCell for mobile labels.
 */
export function ResponsiveTableWrapper({
	children,
	className,
}: {
	children: React.ReactNode
	className?: string
}) {
	return (
		<div
			className={cn("responsive-table rounded-md border overflow-hidden", className)}
			data-responsive-table
		>
			{children}
		</div>
	)
}
