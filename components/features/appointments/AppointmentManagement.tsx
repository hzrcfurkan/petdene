"use client"

import { AppointmentList } from "./AppointmentList"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppointments } from "@/lib/react-query/hooks/appointments"
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"

export function AppointmentManagement() {
	const { data: allData } = useAppointments({ limit: 1000, sort: "date-desc" })
	const { data: pendingData } = useAppointments({ status: "PENDING", limit: 100, sort: "date-asc" })
	const { data: todayData } = useAppointments({
		dateFrom: new Date().toISOString().split("T")[0],
		dateTo: new Date().toISOString().split("T")[0],
		limit: 100,
		sort: "date-asc",
	})

	const allAppointments = allData?.appointments || []
	const pendingAppointments = pendingData?.appointments || []
	const todayAppointments = todayData?.appointments || []

	const stats = {
		total: allAppointments.length,
		pending: allAppointments.filter((a) => a.status === "PENDING").length,
		confirmed: allAppointments.filter((a) => a.status === "CONFIRMED").length,
		completed: allAppointments.filter((a) => a.status === "COMPLETED").length,
		today: todayAppointments.length,
	}

	return (
		<div className="space-y-6">
			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.total}</div>
						<p className="text-xs text-muted-foreground">All appointments</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Pending</CardTitle>
						<Clock className="h-4 w-4 text-yellow-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.pending}</div>
						<p className="text-xs text-muted-foreground">Awaiting confirmation</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Confirmed</CardTitle>
						<CheckCircle className="h-4 w-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.confirmed}</div>
						<p className="text-xs text-muted-foreground">Confirmed bookings</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Completed</CardTitle>
						<CheckCircle className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.completed}</div>
						<p className="text-xs text-muted-foreground">Finished appointments</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Today</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.today}</div>
						<p className="text-xs text-muted-foreground">Scheduled today</p>
					</CardContent>
				</Card>
			</div>

			{/* Tabs */}
			<Tabs defaultValue="all" className="space-y-4">
				<TabsList>
					<TabsTrigger value="all">All Appointments</TabsTrigger>
					<TabsTrigger value="pending">Pending</TabsTrigger>
					<TabsTrigger value="today">Today</TabsTrigger>
				</TabsList>

				<TabsContent value="all" className="space-y-4">
					<AppointmentList showActions={true} />
				</TabsContent>

				<TabsContent value="pending" className="space-y-4">
					<AppointmentList status="PENDING" showActions={true} key="pending" />
				</TabsContent>

				<TabsContent value="today" className="space-y-4">
					<AppointmentList
						dateFrom={new Date().toISOString().split("T")[0]}
						dateTo={new Date().toISOString().split("T")[0]}
						showActions={true}
					/>
				</TabsContent>
			</Tabs>
		</div>
	)
}

