"use client"

import { PetServiceList } from "./PetServiceList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePetServices } from "@/lib/react-query/hooks/pet-services"
import { Sparkles, DollarSign, CheckCircle, XCircle } from "lucide-react"

export function PetServiceManagement() {
	const { data: allData } = usePetServices({ limit: 1000, sort: "date-desc" })
	const { data: activeData } = usePetServices({ active: true, limit: 1000 })

	const allServices = allData?.services || []
	const activeServices = activeData?.services || []

	// Calculate stats
	const stats = {
		total: allServices.length,
		active: activeServices.length,
		inactive: allServices.filter((s) => !s.active).length,
		totalRevenue: allServices.reduce((sum, s) => sum + (s.price * (s._count?.appointments || 0)), 0),
		avgPrice: allServices.length > 0
			? allServices.reduce((sum, s) => sum + s.price, 0) / allServices.length
			: 0,
	}

	return (
		<div className="space-y-6">
			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Services</CardTitle>
						<Sparkles className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.total}</div>
						<p className="text-xs text-muted-foreground">All services</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active</CardTitle>
						<CheckCircle className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.active}</div>
						<p className="text-xs text-muted-foreground">Active services</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Inactive</CardTitle>
						<XCircle className="h-4 w-4 text-gray-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.inactive}</div>
						<p className="text-xs text-muted-foreground">Inactive services</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Avg Price</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${stats.avgPrice.toFixed(2)}</div>
						<p className="text-xs text-muted-foreground">Average service price</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
						<p className="text-xs text-muted-foreground">Potential revenue</p>
					</CardContent>
				</Card>
			</div>

			{/* Service List */}
			<PetServiceList showActions={true} />
		</div>
	)
}

