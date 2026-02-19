"use client"

import { cn } from "@/lib/utils"
import { PawPrint } from "lucide-react"
import Link from "next/link"

interface LogoProps {
	href?: string | null
	showText?: boolean
	className?: string
	textClassName?: string
}

export function Logo({ href = "/", showText = true, className, textClassName }: LogoProps) {
	const content = (
		<span className="inline-flex items-center gap-2 sm:gap-3">
			<span className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/70 text-white font-bold tracking-tight">
				<PawPrint className="h-5 w-5 sm:h-6 sm:w-6" />
				<span className="absolute inset-0 rounded-2xl border border-white/20"></span>
			</span>
			{showText && (
				<span
					className={cn(
						"text-lg sm:text-xl font-semibold tracking-tight text-foreground",
						textClassName
					)}
					style={{ fontFamily: "var(--font-space-grotesk)" }}
				>
					Pet Care
				</span>
			)}
		</span>
	)

	if (!href) {
		return <div className={cn("flex items-center", className)}>{content}</div>
	}

	return (
		<Link href={href} className={cn("inline-flex items-center", className)}>
			{content}
		</Link>
	)
}
