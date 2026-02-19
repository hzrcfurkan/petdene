"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppointments, usePets, useVaccinations, usePrescriptions } from "@/lib/react-query"
import { DashboardCharts } from "./DashboardCharts"
import { AnalyticsCard, RecentTable, AlertCard } from "./DashboardAnalytics"
import { format } from "date-fns"
import { Calendar, PawPrint, Syringe, Pill, Clock, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { currentUserClient } from "@/lib/auth/client"

const statusColors: Record<string, string> = {
	PENDING: "bg-yellow-100 text-yellow-800",
	CONFIRMED: "bg-blue-100 text-blue-800",
	COMPLETED: "bg-green-100 text-green-800",
	CANCELLED: "bg-red-100 text-red-800",
}

export function EnhancedStaffDashboard() {
	const currentUser = currentUserClient()
	const { data: appointmentsData } = useAppointments({ limit: 1000 })
	const { data: petsData } = usePets({ limit: 1000 })
	const { data: vaccinationsData } = useVaccinations({ limit: 1000 })
	const { data: prescriptionsData } = usePrescriptions({ limit: 1000 })

	const appointments = appointmentsData?.appointments || []
	const pets = petsData?.pets || []
	const vaccinations = vaccinationsData?.vaccinations || []
	const prescriptions = prescriptionsData?.prescriptions || []

	const now = new Date()
	const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
	const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

	// Filter appointments assigned to current staff
	const myAppointments = useMemo(() => {
		return appointments.filter((a) => a.staffId === currentUser?.id)
	}, [appointments, currentUser?.id])

	// Calculate statistics
	const stats = useMemo(() => {
		const pendingAppointments = myAppointments.filter((a) => a.status === "PENDING")
		const todayAppointments = myAppointments.filter(
			(a) => format(new Date(a.date), "yyyy-MM-dd") === format(now, "yyyy-MM-dd")
		)
		const upcomingAppointments = myAppointments.filter(
			(a) => new Date(a.date) >= now && (a.status === "PENDING" || a.status === "CONFIRMED")
		)
		const overdueVaccinations = vaccinations.filter(
			(v) => v.nextDue && new Date(v.nextDue) < now
		)
		const upcomingVaccinations = vaccinations.filter(
			(v) => v.nextDue && new Date(v.nextDue) >= now && new Date(v.nextDue) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
		)

		return {
			myAppointments: myAppointments.length,
			pendingAppointments: pendingAppointments.length,
			todayAppointments: todayAppointments.length,
			upcomingAppointments: upcomingAppointments.length,
			totalPets: pets.length,
			overdueVaccinations: overdueVaccinations.length,
			upcomingVaccinations: upcomingVaccinations.length,
			totalPrescriptions: prescriptions.length,
		}
	}, [myAppointments, pets, vaccinations, prescriptions, now, sevenDaysAgo])

	// Prepare chart data
	const appointmentsChartData = useMemo(() => {
		const last7Days = Array.from({ length: 7 }, (_, i) => {
			const date = new Date(now)
			date.setDate(date.getDate() - (6 - i))
			return {
				name: format(date, "MMM dd"),
				value: myAppointments.filter(
					(a) => format(new Date(a.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
				).length,
			}
		})
		return last7Days
	}, [myAppointments, now])

	const statusChartData = useMemo(() => {
		const statusCounts: Record<string, number> = {}
		myAppointments.forEach((a) => {
			statusCounts[a.status] = (statusCounts[a.status] || 0) + 1
		})
		return Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
	}, [myAppointments])

	// Recent data
	const todayAppointments = useMemo(() => {
		return myAppointments
			.filter((a) => format(new Date(a.date), "yyyy-MM-dd") === format(now, "yyyy-MM-dd"))
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
	}, [myAppointments, now])

	const upcomingAppointments = useMemo(() => {
		return myAppointments
			.filter((a) => new Date(a.date) >= now && (a.status === "PENDING" || a.status === "CONFIRMED"))
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
			.slice(0, 5)
	}, [myAppointments, now])

	const alerts = useMemo(() => {
		const alertItems: string[] = []
		if (stats.pendingAppointments > 0) {
			alertItems.push(`${stats.pendingAppointments} appointments need approval`)
		}
		if (stats.todayAppointments > 0) {
			alertItems.push(`${stats.todayAppointments} appointments scheduled for today`)
		}
		if (stats.overdueVaccinations > 0) {
			alertItems.push(`${stats.overdueVaccinations} vaccinations are overdue`)
		}
		return alertItems
	}, [stats])

	return (
		<div className="space-y-6">
			{/* Analytics Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<AnalyticsCard
					title="My Appointments"
					value={stats.myAppointments}
					icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
					description={`${stats.todayAppointments} today`}
				/>
				<AnalyticsCard
					title="Pending Approvals"
					value={stats.pendingAppointments}
					icon={<Clock className="h-4 w-4 text-muted-foreground" />}
					description="Requires action"
				/>
				<AnalyticsCard
					title="Upcoming Appointments"
					value={stats.upcomingAppointments}
					icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
					description="Scheduled visits"
				/>
				<AnalyticsCard
					title="Total Pets"
					value={stats.totalPets}
					icon={<PawPrint className="h-4 w-4 text-muted-foreground" />}
					description="In system"
				/>
			</div>

			{/* Alerts */}
			{alerts.length > 0 && (
				<AlertCard type="info" title="Today's Tasks" items={alerts} />
			)}

			{/* Charts */}
			<DashboardCharts
				appointmentsData={appointmentsChartData}
				statusData={statusChartData}
			/>

			{/* Recent Data Tables */}
			<div className="grid gap-4 md:grid-cols-2">
				<RecentTable
					title="Today's Appointments"
					data={todayAppointments}
					columns={[
						{
							key: "time",
							label: "Time",
							render: (item) => format(new Date(item.date), "h:mm a"),
						},
						{
							key: "pet",
							label: "Pet",
							render: (item) => item.pet?.name || "N/A",
						},
						{
							key: "service",
							label: "Service",
							render: (item) => item.service?.title || "N/A",
						},
						{
							key: "status",
							label: "Status",
							render: (item) => (
								<Badge className={statusColors[item.status] || ""}>{item.status}</Badge>
							),
						},
					]}
					emptyMessage="No appointments scheduled for today"
				/>

				<RecentTable
					title="Upcoming Appointments"
					data={upcomingAppointments}
					columns={[
						{
							key: "date",
							label: "Date",
							render: (item) => format(new Date(item.date), "MMM dd, yyyy"),
						},
						{
							key: "time",
							label: "Time",
							render: (item) => format(new Date(item.date), "h:mm a"),
						},
						{
							key: "pet",
							label: "Pet",
							render: (item) => item.pet?.name || "N/A",
						},
						{
							key: "status",
							label: "Status",
							render: (item) => (
								<Badge className={statusColors[item.status] || ""}>{item.status}</Badge>
							),
						},
					]}
					emptyMessage="No upcoming appointments"
				/>
			</div>

			{/* Quick Stats Grid */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Overdue Vaccinations</CardTitle>
						<Syringe className="h-4 w-4 text-red-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.overdueVaccinations}</div>
						<p className="text-xs text-muted-foreground">Need attention</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Upcoming Vaccinations</CardTitle>
						<Syringe className="h-4 w-4 text-yellow-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.upcomingVaccinations}</div>
						<p className="text-xs text-muted-foreground">Next 7 days</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
						<Pill className="h-4 w-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalPrescriptions}</div>
						<p className="text-xs text-muted-foreground">Total issued</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Completed Today</CardTitle>
						<Calendar className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{myAppointments.filter(
								(a) =>
									format(new Date(a.date), "yyyy-MM-dd") === format(now, "yyyy-MM-dd") &&
									a.status === "COMPLETED"
							).length}
						</div>
						<p className="text-xs text-muted-foreground">Appointments</p>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

