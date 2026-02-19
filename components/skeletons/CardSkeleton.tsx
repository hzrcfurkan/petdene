"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function CardSkeleton() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-6 w-32" />
				<Skeleton className="h-4 w-48 mt-2" />
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-3/4" />
					<Skeleton className="h-4 w-1/2" />
				</div>
			</CardContent>
		</Card>
	)
}

