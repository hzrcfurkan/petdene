"use client"

import { PrescriptionList } from "./PrescriptionList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePrescriptions } from "@/lib/react-query/hooks/prescriptions"
import { Pill, Calendar } from "lucide-react"

export function PrescriptionManagement() {
	const { data: allData } = usePrescriptions({ limit: 1000, sort: "date-desc" })
	const { data: recentData } = usePrescriptions({ limit: 100, sort: "date-desc" })

	const allPrescriptions = allData?.prescriptions || []
	const recentPrescriptions = recentData?.prescriptions || []

	// Calculate stats
	const now = new Date()
	const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
	
	const stats = {
		total: allPrescriptions.length,
		recent: recentPrescriptions.filter((p) => 
			new Date(p.dateIssued) >= thirtyDaysAgo
		).length,
		thisMonth: allPrescriptions.filter((p) => {
			const issuedDate = new Date(p.dateIssued)
			return issuedDate.getMonth() === now.getMonth() && 
				   issuedDate.getFullYear() === now.getFullYear()
		}).length,
		uniqueMedicines: new Set(allPrescriptions.map((p) => p.medicineName)).size,
	}

	return (
		<div className="space-y-6">
			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
						<Pill className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.total}</div>
						<p className="text-xs text-muted-foreground">All prescriptions</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">This Month</CardTitle>
						<Calendar className="h-4 w-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.thisMonth}</div>
						<p className="text-xs text-muted-foreground">Issued this month</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Recent (30 days)</CardTitle>
						<Calendar className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.recent}</div>
						<p className="text-xs text-muted-foreground">Last 30 days</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Unique Medicines</CardTitle>
						<Pill className="h-4 w-4 text-purple-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.uniqueMedicines}</div>
						<p className="text-xs text-muted-foreground">Different medications</p>
					</CardContent>
				</Card>
			</div>

			{/* Tabs */}
			<Tabs defaultValue="all" className="space-y-4">
				<TabsList>
					<TabsTrigger value="all">All Prescriptions</TabsTrigger>
					<TabsTrigger value="recent">Recent (30 days)</TabsTrigger>
				</TabsList>

				<TabsContent value="all" className="space-y-4">
					<PrescriptionList showActions={true} />
				</TabsContent>

				<TabsContent value="recent" className="space-y-4">
					<PrescriptionList 
						dateFrom={thirtyDaysAgo.toISOString().split("T")[0]}
						showActions={true} 
					/>
				</TabsContent>
			</Tabs>
		</div>
	)
}

