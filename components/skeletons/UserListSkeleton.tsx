"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function UserListSkeleton({ count = 3 }: { count?: number }) {
	return (
		<div className="space-y-4">
			{Array.from({ length: count }).map((_, i) => (
				<div key={i} className="flex items-center justify-between p-4 border rounded-lg">
					<div className="flex-1 space-y-2">
						<Skeleton className="h-5 w-32" />
						<Skeleton className="h-4 w-48" />
						<Skeleton className="h-4 w-36" />
					</div>
					<div className="flex items-center gap-2">
						<Skeleton className="h-6 w-20" />
						<Skeleton className="h-8 w-8 rounded-full" />
					</div>
				</div>
			))}
		</div>
	)
}

