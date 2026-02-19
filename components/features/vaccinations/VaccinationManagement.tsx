"use client"

import { VaccinationList } from "./VaccinationList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useVaccinations } from "@/lib/react-query/hooks/vaccinations"
import { Syringe, AlertCircle, CheckCircle } from "lucide-react"

export function VaccinationManagement() {
	const { data: allData } = useVaccinations({ limit: 1000, sort: "date-desc" })
	const { data: upcomingData } = useVaccinations({ upcoming: true, limit: 100, sort: "nextdue-asc" })

	const allVaccinations = allData?.vaccinations || []
	const upcomingVaccinations = upcomingData?.vaccinations || []

	// Calculate stats
	const now = new Date()
	const stats = {
		total: allVaccinations.length,
		due: allVaccinations.filter((v) =>
			v.nextDue ? new Date(v.nextDue) < now : false
		).length,
		upcoming: allVaccinations.filter((v) =>
			v.nextDue
				? new Date(v.nextDue) >= now &&
				  new Date(v.nextDue) <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
				: false
		).length,
		noNextDue: allVaccinations.filter((v) => !v.nextDue).length,
	}

	return (
		<div className="space-y-6">
			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Records</CardTitle>
						<Syringe className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.total}</div>
						<p className="text-xs text-muted-foreground">All vaccinations</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Due</CardTitle>
						<AlertCircle className="h-4 w-4 text-red-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.due}</div>
						<p className="text-xs text-muted-foreground">Overdue vaccinations</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Upcoming</CardTitle>
						<CheckCircle className="h-4 w-4 text-yellow-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.upcoming}</div>
						<p className="text-xs text-muted-foreground">Due in next 30 days</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">No Next Due</CardTitle>
						<Syringe className="h-4 w-4 text-gray-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.noNextDue}</div>
						<p className="text-xs text-muted-foreground">No follow-up scheduled</p>
					</CardContent>
				</Card>
			</div>

			{/* Tabs */}
			<Tabs defaultValue="all" className="space-y-4">
				<TabsList>
					<TabsTrigger value="all">All Vaccinations</TabsTrigger>
					<TabsTrigger value="upcoming">Upcoming</TabsTrigger>
				</TabsList>

				<TabsContent value="all" className="space-y-4">
					<VaccinationList showActions={true} />
				</TabsContent>

				<TabsContent value="upcoming" className="space-y-4">
					<VaccinationList upcoming={true} showActions={true} />
				</TabsContent>
			</Tabs>
		</div>
	)
}

