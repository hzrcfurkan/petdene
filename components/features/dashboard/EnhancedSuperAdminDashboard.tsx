"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useStats, useAppointments, usePets, useInvoices } from "@/lib/react-query"
import { DashboardCharts } from "./DashboardCharts"
import { AnalyticsCard, RecentTable, AlertCard } from "./DashboardAnalytics"
import { format } from "date-fns"
import {
	Users,
	UserCheck,
	Shield,
	UserPlus,
	Calendar,
	PawPrint,
	DollarSign,
	TrendingUp,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

const statusColors: Record<string, string> = {
	PENDING: "bg-yellow-100 text-yellow-800",
	CONFIRMED: "bg-blue-100 text-blue-800",
	COMPLETED: "bg-green-100 text-green-800",
	CANCELLED: "bg-red-100 text-red-800",
}

export function EnhancedSuperAdminDashboard() {
	const { data: usersResponse } = useStats()
	const { data: appointmentsData } = useAppointments({ limit: 1000 })
	const { data: petsData } = usePets({ limit: 1000 })
	const { data: invoicesData } = useInvoices({ limit: 1000 })

	const users = usersResponse?.users || []
	const appointments = appointmentsData?.appointments || []
	const pets = petsData?.pets || []
	const invoices = invoicesData?.invoices || []

	const now = new Date()
	const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

	// Calculate user statistics
	const userStats = useMemo(() => {
		const customers = users.filter((u) => u.role === "CUSTOMER").length
		const admins = users.filter((u) => u.role === "ADMIN").length
		const superAdmins = users.filter((u) => u.role === "SUPER_ADMIN").length
		const staff = users.filter((u) => u.role === "STAFF").length
		const newUsers = users.filter(
			(u) => new Date(u.createdAt || now) >= thirtyDaysAgo
		).length

		return {
			total: users.length,
			customers,
			admins,
			superAdmins,
			staff,
			newUsers,
		}
	}, [users, thirtyDaysAgo, now])

	// Calculate business statistics
	const businessStats = useMemo(() => {
		const recentAppointments = appointments.filter((a) => new Date(a.date) >= thirtyDaysAgo)
		const paidInvoices = invoices.filter((i) => i.status === "PAID")
		const unpaidInvoices = invoices.filter((i) => i.status === "UNPAID")
		const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0)
		const monthlyRevenue = invoices
			.filter(
				(i) =>
					new Date(i.createdAt) >= thirtyDaysAgo &&
					i.status === "PAID"
			)
			.reduce((sum, inv) => sum + inv.amount, 0)
		const unpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0)

		return {
			totalAppointments: appointments.length,
			recentAppointments: recentAppointments.length,
			totalPets: pets.length,
			totalRevenue,
			monthlyRevenue,
			unpaidAmount,
			totalInvoices: invoices.length,
			paidInvoices: paidInvoices.length,
			unpaidInvoices: unpaidInvoices.length,
		}
	}, [appointments, pets, invoices, thirtyDaysAgo])

	// Prepare chart data
	const userChartData = useMemo(() => {
		return [
			{ name: "Customers", value: userStats.customers },
			{ name: "Staff", value: userStats.staff },
			{ name: "Admins", value: userStats.admins },
			{ name: "Super Admins", value: userStats.superAdmins },
		]
	}, [userStats])

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

	// Recent data
	const recentUsers = useMemo(() => {
		return users
			.sort((a, b) => new Date(b.createdAt || now).getTime() - new Date(a.createdAt || now).getTime())
			.slice(0, 5)
	}, [users, now])

	const recentInvoices = useMemo(() => {
		return invoices
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
			.slice(0, 5)
	}, [invoices])

	const alerts = useMemo(() => {
		const alertItems: string[] = []
		if (businessStats.unpaidInvoices > 0) {
			alertItems.push(`$${businessStats.unpaidAmount.toFixed(2)} in unpaid invoices`)
		}
		if (userStats.newUsers > 0) {
			alertItems.push(`${userStats.newUsers} new users in the last 30 days`)
		}
		return alertItems
	}, [businessStats, userStats])

	return (
		<div className="space-y-6">
			{/* User Statistics */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
				<AnalyticsCard
					title="Total Users"
					value={userStats.total}
					icon={<Users className="h-4 w-4 text-muted-foreground" />}
					description={`${userStats.newUsers} new this month`}
				/>
				<AnalyticsCard
					title="Customers"
					value={userStats.customers}
					icon={<UserPlus className="h-4 w-4 text-muted-foreground" />}
					description="Customer accounts"
				/>
				<AnalyticsCard
					title="Admins"
					value={userStats.admins}
					icon={<Shield className="h-4 w-4 text-muted-foreground" />}
					description="Admin accounts"
				/>
				<AnalyticsCard
					title="Staff"
					value={userStats.staff}
					icon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
					description="Staff accounts"
				/>
				<AnalyticsCard
					title="Super Admins"
					value={userStats.superAdmins}
					icon={<Shield className="h-4 w-4 text-muted-foreground" />}
					description="Super admin accounts"
				/>
			</div>

			{/* Business Statistics */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<AnalyticsCard
					title="Total Revenue"
					value={`$${businessStats.totalRevenue.toFixed(2)}`}
					icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
					description={`$${businessStats.monthlyRevenue.toFixed(2)} this month`}
				/>
				<AnalyticsCard
					title="Total Appointments"
					value={businessStats.totalAppointments}
					icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
					description={`${businessStats.recentAppointments} in last 30 days`}
				/>
				<AnalyticsCard
					title="Total Pets"
					value={businessStats.totalPets}
					icon={<PawPrint className="h-4 w-4 text-muted-foreground" />}
					description="Registered pets"
				/>
				<AnalyticsCard
					title="Total Invoices"
					value={businessStats.totalInvoices}
					icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
					description={`${businessStats.paidInvoices} paid, ${businessStats.unpaidInvoices} unpaid`}
				/>
			</div>

			{/* Alerts */}
			{alerts.length > 0 && (
				<AlertCard type="info" title="System Overview" items={alerts} />
			)}

			{/* Charts */}
			<DashboardCharts
				appointmentsData={appointmentsChartData}
				revenueData={revenueChartData}
				statusData={userChartData}
			/>

			{/* Recent Data Tables */}
			<div className="grid gap-4 md:grid-cols-2">
				<RecentTable
					title="Recent Users"
					data={recentUsers}
					columns={[
						{
							key: "name",
							label: "Name",
							render: (item) => item.name || item.email,
						},
						{
							key: "email",
							label: "Email",
							render: (item) => item.email,
						},
						{
							key: "role",
							label: "Role",
							render: (item) => (
								<Badge
									className={
										item.role === "SUPER_ADMIN"
											? "bg-purple-100 text-purple-800"
											: item.role === "ADMIN"
												? "bg-blue-100 text-blue-800"
												: item.role === "STAFF"
													? "bg-green-100 text-green-800"
													: "bg-gray-100 text-gray-800"
									}
								>
									{item.role}
								</Badge>
							),
						},
						{
							key: "createdAt",
							label: "Joined",
							render: (item) =>
								item.createdAt
									? format(new Date(item.createdAt), "MMM dd, yyyy")
									: "N/A",
						},
					]}
					emptyMessage="No recent users"
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
		</div>
	)
}

