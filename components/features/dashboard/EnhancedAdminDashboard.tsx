"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppointments, usePets, useInvoices, usePetServices, useVaccinations } from "@/lib/react-query"
import { DashboardCharts } from "./DashboardCharts"
import { AnalyticsCard, RecentTable, AlertCard } from "./DashboardAnalytics"
import { format } from "date-fns"
import {
	Calendar,
	PawPrint,
	DollarSign,
	Sparkles,
	Syringe,
	TrendingUp,
	Users,
	AlertCircle,
	Clock,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AppointmentList } from "@/components/features/appointments/AppointmentList"

const statusColors: Record<string, string> = {
	PENDING: "bg-yellow-100 text-yellow-800",
	CONFIRMED: "bg-blue-100 text-blue-800",
	COMPLETED: "bg-green-100 text-green-800",
	CANCELLED: "bg-red-100 text-red-800",
}

export function EnhancedAdminDashboard() {
	const { data: appointmentsData } = useAppointments({ limit: 1000 })
	const { data: petsData } = usePets({ limit: 1000 })
	const { data: invoicesData } = useInvoices({ limit: 1000 })
	const { data: servicesData } = usePetServices({ limit: 1000 })
	const { data: vaccinationsData } = useVaccinations({ limit: 1000 })

	const appointments = appointmentsData?.appointments || []
	const pets = petsData?.pets || []
	const invoices = invoicesData?.invoices || []
	const services = servicesData?.services || []
	const vaccinations = vaccinationsData?.vaccinations || []

	const now = new Date()
	const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
	const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

	// Calculate statistics
	const stats = useMemo(() => {
		const recentAppointments = appointments.filter((a) => new Date(a.date) >= thirtyDaysAgo)
		const recentInvoices = invoices.filter((i) => new Date(i.createdAt) >= thirtyDaysAgo)
		const paidInvoices = invoices.filter((i) => i.status === "PAID")
		const unpaidInvoices = invoices.filter((i) => i.status === "UNPAID")
		const pendingAppointments = appointments.filter((a) => a.status === "PENDING")
		const upcomingAppointments = appointments.filter(
			(a) => new Date(a.date) >= now && (a.status === "PENDING" || a.status === "CONFIRMED")
		)
		const overdueVaccinations = vaccinations.filter(
			(v) => v.nextDue && new Date(v.nextDue) < now
		)

		const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0)
		const unpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0)
		const monthlyRevenue = recentInvoices
			.filter((i) => i.status === "PAID")
			.reduce((sum, inv) => sum + inv.amount, 0)

		return {
			totalAppointments: appointments.length,
			recentAppointments: recentAppointments.length,
			pendingAppointments: pendingAppointments.length,
			upcomingAppointments: upcomingAppointments.length,
			totalPets: pets.length,
			totalRevenue,
			monthlyRevenue,
			unpaidAmount,
			totalInvoices: invoices.length,
			paidInvoices: paidInvoices.length,
			unpaidInvoices: unpaidInvoices.length,
			overdueVaccinations: overdueVaccinations.length,
		}
	}, [appointments, pets, invoices, vaccinations, now, thirtyDaysAgo])

	// Prepare chart data
	const appointmentsChartData = useMemo(() => {
		const last7Days = Array.from({ length: 7 }, (_, i) => {
			const date = new Date(now)
			date.setDate(date.getDate() - (6 - i))
			return {
				name: format(date, "MMM dd"),
				value: appointments.filter(
					(a) => format(new Date(a.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
				).length,
			}
		})
		return last7Days
	}, [appointments, now])

	const revenueChartData = useMemo(() => {
		const last6Months = Array.from({ length: 6 }, (_, i) => {
			const date = new Date(now)
			date.setMonth(date.getMonth() - (5 - i))
			const monthInvoices = invoices.filter(
				(i) =>
					format(new Date(i.createdAt), "yyyy-MM") === format(date, "yyyy-MM") &&
					i.status === "PAID"
			)
			return {
				name: format(date, "MMM yyyy"),
				value: monthInvoices.reduce((sum, inv) => sum + inv.amount, 0),
			}
		})
		return last6Months
	}, [invoices, now])

	const statusChartData = useMemo(() => {
		const statusCounts: Record<string, number> = {}
		appointments.forEach((a) => {
			statusCounts[a.status] = (statusCounts[a.status] || 0) + 1
		})
		return Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
	}, [appointments])

	const serviceChartData = useMemo(() => {
		const serviceCounts: Record<string, number> = {}
		appointments.forEach((a) => {
			const serviceName = a.service?.title || "Unknown"
			serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1
		})
		return Object.entries(serviceCounts)
			.map(([name, value]) => ({ name, value }))
			.sort((a, b) => b.value - a.value)
			.slice(0, 5)
	}, [appointments])

	// Recent data
	const recentAppointments = useMemo(() => {
		return appointments
			.filter((a) => new Date(a.date) >= sevenDaysAgo)
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
			.slice(0, 5)
	}, [appointments, sevenDaysAgo])

	const recentInvoices = useMemo(() => {
		return invoices
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
			.slice(0, 5)
	}, [invoices])

	const alerts = useMemo(() => {
		const alertItems: string[] = []
		if (stats.pendingAppointments > 0) {
			alertItems.push(`${stats.pendingAppointments} appointments pending approval`)
		}
		if (stats.overdueVaccinations > 0) {
			alertItems.push(`${stats.overdueVaccinations} vaccinations are overdue`)
		}
		if (stats.unpaidInvoices > 0) {
			alertItems.push(`$${stats.unpaidAmount.toFixed(2)} in unpaid invoices`)
		}
		return alertItems
	}, [stats])

	return (
		<div className="space-y-6">
			{/* Analytics Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<AnalyticsCard
					title="Total Appointments"
					value={stats.totalAppointments}
					icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
					description={`${stats.recentAppointments} in last 30 days`}
				/>
				<AnalyticsCard
					title="Total Revenue"
					value={`$${stats.totalRevenue.toFixed(2)}`}
					icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
					description={`$${stats.monthlyRevenue.toFixed(2)} this month`}
				/>
				<AnalyticsCard
					title="Total Pets"
					value={stats.totalPets}
					icon={<PawPrint className="h-4 w-4 text-muted-foreground" />}
					description="Registered pets"
				/>
				<AnalyticsCard
					title="Upcoming Appointments"
					value={stats.upcomingAppointments}
					icon={<Clock className="h-4 w-4 text-muted-foreground" />}
					description="Scheduled visits"
				/>
			</div>

			{/* Alerts */}
			{alerts.length > 0 && (
				<AlertCard type="warning" title="Action Required" items={alerts} />
			)}

			{/* Charts */}
			<DashboardCharts
				appointmentsData={appointmentsChartData}
				revenueData={revenueChartData}
				statusData={statusChartData}
				serviceData={serviceChartData}
			/>

			{/* Recent Data Tables */}
			<div className="grid gap-4 md:grid-cols-2">
				<RecentTable
					title="Recent Appointments"
					data={recentAppointments}
					columns={[
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
							key: "date",
							label: "Date",
							render: (item) => format(new Date(item.date), "MMM dd, yyyy"),
						},
						{
							key: "status",
							label: "Status",
							render: (item) => (
								<Badge className={statusColors[item.status] || ""}>{item.status}</Badge>
							),
						},
					]}
					emptyMessage="No recent appointments"
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
						<CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
						<AlertCircle className="h-4 w-4 text-yellow-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.pendingAppointments}</div>
						<p className="text-xs text-muted-foreground">Requires attention</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Unpaid Invoices</CardTitle>
						<DollarSign className="h-4 w-4 text-yellow-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.unpaidInvoices}</div>
						<p className="text-xs text-muted-foreground">${stats.unpaidAmount.toFixed(2)}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Services</CardTitle>
						<Sparkles className="h-4 w-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{services.filter((s) => s.active).length}
						</div>
						<p className="text-xs text-muted-foreground">Out of {services.length} total</p>
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
			</div>
		</div>
	)
}

