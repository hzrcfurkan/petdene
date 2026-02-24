"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppointments, usePets, useVaccinations, useInvoices } from "@/lib/react-query"
import { DashboardCharts } from "./DashboardCharts"
import { AnalyticsCard, RecentTable, AlertCard } from "./DashboardAnalytics"
import { format } from "date-fns"
import { Calendar, PawPrint, Syringe, FileText, Clock, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { currentUserClient } from "@/lib/auth/client"
import { CustomerAppointmentPopup } from "@/components/features/appointments/CustomerAppointmentPopup"

const statusColors: Record<string, string> = {
	PENDING: "bg-yellow-100 text-yellow-800",
	CONFIRMED: "bg-blue-100 text-blue-800",
	COMPLETED: "bg-green-100 text-green-800",
	CANCELLED: "bg-red-100 text-red-800",
}

export function EnhancedCustomerDashboard() {
	const currentUser = currentUserClient()
	const { data: appointmentsData, refetch: refetchAppointments } = useAppointments({ limit: 1000 })
	const { data: petsData } = usePets({ ownerId: currentUser?.id, limit: 1000 })
	const { data: vaccinationsData } = useVaccinations({ limit: 1000 })
	const { data: invoicesData } = useInvoices({ limit: 1000 })

	const appointments = appointmentsData?.appointments || []
	const pets = petsData?.pets || []
	const vaccinations = vaccinationsData?.vaccinations || []
	const invoices = invoicesData?.invoices || []

	// Filter to customer's data
	const myPets = pets
	const myAppointments = appointments.filter((a) =>
		myPets.some((p) => p.id === a.petId)
	)
	const myVaccinations = vaccinations.filter((v) => myPets.some((p) => p.id === v.petId))
	const myInvoices = invoices.filter((i) =>
		myPets.some((p) => p.id === i.appointment?.pet?.id)
	)

	const now = new Date()
	const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

	// Calculate statistics
	const stats = useMemo(() => {
		const upcomingAppointments = myAppointments.filter(
			(a) => new Date(a.date) >= now && (a.status === "PENDING" || a.status === "CONFIRMED")
		)
		const upcomingVaccinations = myVaccinations.filter(
			(v) => v.nextDue && new Date(v.nextDue) >= now
		)
		const overdueVaccinations = myVaccinations.filter(
			(v) => v.nextDue && new Date(v.nextDue) < now
		)
		const unpaidInvoices = myInvoices.filter((i) => i.status === "UNPAID")
		const totalSpent = myInvoices
			.filter((i) => i.status === "PAID")
			.reduce((sum, inv) => sum + inv.amount, 0)

		return {
			totalPets: myPets.length,
			totalAppointments: myAppointments.length,
			upcomingAppointments: upcomingAppointments.length,
			upcomingVaccinations: upcomingVaccinations.length,
			overdueVaccinations: overdueVaccinations.length,
			unpaidInvoices: unpaidInvoices.length,
			totalSpent,
		}
	}, [myPets, myAppointments, myVaccinations, myInvoices, now])

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
	const upcomingAppointments = useMemo(() => {
		return myAppointments
			.filter((a) => new Date(a.date) >= now && (a.status === "PENDING" || a.status === "CONFIRMED"))
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
			.slice(0, 5)
	}, [myAppointments, now])

	const recentInvoices = useMemo(() => {
		return myInvoices
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
			.slice(0, 5)
	}, [myInvoices])

	const alerts = useMemo(() => {
		const alertItems: string[] = []
		if (stats.upcomingAppointments > 0) {
			alertItems.push(`${stats.upcomingAppointments} upcoming appointments`)
		}
		if (stats.overdueVaccinations > 0) {
			alertItems.push(`${stats.overdueVaccinations} vaccinations are overdue`)
		}
		if (stats.unpaidInvoices > 0) {
			alertItems.push(`${stats.unpaidInvoices} unpaid invoices`)
		}
		return alertItems
	}, [stats])

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl lg:text-4xl font-semibold text-foreground mb-2">
						Welcome back, {currentUser?.name || "User"}
					</h1>
					<p className="text-sm text-muted-foreground">Manage your pets and their care</p>
				</div>
				<CustomerAppointmentPopup onSuccess={() => refetchAppointments()} />
			</div>

			{/* Analytics Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<AnalyticsCard
					title="My Pets"
					value={stats.totalPets}
					icon={<PawPrint className="h-4 w-4 text-muted-foreground" />}
					description="Registered pets"
				/>
				<AnalyticsCard
					title="Upcoming Appointments"
					value={stats.upcomingAppointments}
					icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
					description="Scheduled visits"
				/>
				<AnalyticsCard
					title="Vaccinations Due"
					value={stats.upcomingVaccinations}
					icon={<Syringe className="h-4 w-4 text-muted-foreground" />}
					description="Upcoming vaccinations"
				/>
				<AnalyticsCard
					title="Total Spent"
					value={`$${stats.totalSpent.toFixed(2)}`}
					icon={<FileText className="h-4 w-4 text-muted-foreground" />}
					description="All time"
				/>
			</div>

			{/* Alerts */}
			{alerts.length > 0 && (
				<AlertCard type="info" title="Important Reminders" items={alerts} />
			)}

			{/* Charts */}
			<DashboardCharts
				appointmentsData={appointmentsChartData}
				statusData={statusChartData}
			/>

			{/* Recent Data Tables */}
			<div className="grid gap-4 md:grid-cols-2">
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

				<RecentTable
					title="Recent Invoices"
					data={recentInvoices}
					columns={[
						{
							key: "pet",
							label: "Pet",
							render: (item) => item.appointment?.pet?.name || "N/A",
						},
						{
							key: "amount",
							label: "Amount",
							render: (item) => `$${item.amount.toFixed(2)}`,
						},
						{
							key: "status",
							label: "Status",
							render: (item) => (
								<Badge
									className={
										item.status === "PAID"
											? "bg-green-100 text-green-800"
											: item.status === "UNPAID"
												? "bg-yellow-100 text-yellow-800"
												: "bg-red-100 text-red-800"
									}
								>
									{item.status}
								</Badge>
							),
						},
						{
							key: "createdAt",
							label: "Date",
							render: (item) => format(new Date(item.createdAt), "MMM dd, yyyy"),
						},
					]}
					emptyMessage="No recent invoices"
				/>
			</div>

			{/* Quick Stats Grid */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
						<Calendar className="h-4 w-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalAppointments}</div>
						<p className="text-xs text-muted-foreground">All time</p>
					</CardContent>
				</Card>

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
						<CardTitle className="text-sm font-medium">Unpaid Invoices</CardTitle>
						<FileText className="h-4 w-4 text-yellow-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.unpaidInvoices}</div>
						<p className="text-xs text-muted-foreground">Pending payment</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Completed Visits</CardTitle>
						<Calendar className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{myAppointments.filter((a) => a.status === "COMPLETED").length}
						</div>
						<p className="text-xs text-muted-foreground">Total completed</p>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

