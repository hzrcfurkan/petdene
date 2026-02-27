"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, AlertCircle } from "lucide-react"
import { useCurrency } from "@/components/providers/CurrencyProvider"
import { useReports } from "@/lib/react-query/hooks/reports"
import { useState } from "react"
import { format } from "date-fns"

function getMonthRange() {
	const now = new Date()
	const first = new Date(now.getFullYear(), now.getMonth(), 1)
	const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
	return {
		from: first.toISOString().split("T")[0],
		to: last.toISOString().split("T")[0],
	}
}

export function ReportsView() {
	const { formatCurrency } = useCurrency()
	const monthRange = getMonthRange()
	const [dateMode, setDateMode] = useState<"single" | "range">("range")
	const [date, setDate] = useState(new Date().toISOString().split("T")[0])
	const [dateFrom, setDateFrom] = useState(monthRange.from)
	const [dateTo, setDateTo] = useState(monthRange.to)
	const { data, isLoading, error } = useReports(
		dateMode === "range" && dateFrom && dateTo
			? { dateFrom, dateTo }
			: { date }
	)

	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Daily Revenue</CardTitle>
						<CardDescription>Loading...</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">—</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Total Outstanding Debt</CardTitle>
						<CardDescription>Loading...</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">—</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	if (error) {
		return (
			<Card>
				<CardContent className="pt-6">
					<p className="text-destructive">Failed to load reports.</p>
				</CardContent>
			</Card>
		)
	}

	const dailyRevenue = data?.dailyRevenue?.amount ?? 0
	const totalDebt = data?.totalOutstandingDebt ?? 0
	const transactionCount = data?.dailyRevenue?.transactionCount ?? 0

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-end gap-4 rounded-lg border p-4">
				<div>
					<Label className="text-xs">Report Type</Label>
					<Select value={dateMode} onValueChange={(v: "single" | "range") => setDateMode(v)}>
						<SelectTrigger className="w-[180px] mt-2">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="single">Single Day</SelectItem>
							<SelectItem value="range">Date Range</SelectItem>
						</SelectContent>
					</Select>
				</div>
				{dateMode === "single" ? (
					<div className="space-y-2">
						<Label htmlFor="report-date" className="text-xs">Date</Label>
						<Input
							id="report-date"
							type="date"
							value={date}
							onChange={(e) => setDate(e.target.value)}
							className="mt-2"
						/>
					</div>
				) : (
					<>
						<div className="space-y-2">
							<Label htmlFor="report-dateFrom" className="text-xs">Start Date</Label>
							<Input
								id="report-dateFrom"
								type="date"
								value={dateFrom}
								onChange={(e) => setDateFrom(e.target.value)}
								className="mt-2"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="report-dateTo" className="text-xs">End Date</Label>
							<Input
								id="report-dateTo"
								type="date"
								value={dateTo}
								onChange={(e) => setDateTo(e.target.value)}
								className="mt-2"
							/>
						</div>
					</>
				)}
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingUp className="w-5 h-5" />
							Daily Revenue
						</CardTitle>
						<CardDescription>
							{data?.dailyRevenue?.date
								? data?.dailyRevenue?.dateTo
									? `${format(new Date(data.dailyRevenue.date + "T00:00:00"), "MMM dd, yyyy")} – ${format(new Date(data.dailyRevenue.dateTo + "T00:00:00"), "MMM dd, yyyy")}`
									: format(new Date(data.dailyRevenue.date + "T00:00:00"), "MMMM dd, yyyy")
								: "—"}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-green-600">
							{formatCurrency(dailyRevenue)}
						</div>
						<p className="text-sm text-muted-foreground mt-2">
							{transactionCount} payment{transactionCount !== 1 ? "s" : ""} recorded
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertCircle className="w-5 h-5" />
							Total Outstanding Debt
						</CardTitle>
						<CardDescription>Accounts receivable across all visits</CardDescription>
					</CardHeader>
					<CardContent>
						<div
							className={`text-3xl font-bold ${totalDebt > 0 ? "text-amber-600" : "text-muted-foreground"}`}
						>
							{formatCurrency(totalDebt)}
						</div>
						<p className="text-sm text-muted-foreground mt-2">
							{totalDebt > 0 ? "Unpaid visit balances" : "All visits paid"}
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Customer Balances (Accounts Receivable) */}
			{data?.customerBalances && data.customerBalances.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Customer Balances (Accounts Receivable)</CardTitle>
						<CardDescription>Outstanding debt per customer - updates automatically when payments are recorded</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{data.customerBalances.map((cb) => (
								<div
									key={cb.ownerId}
									className="flex items-center justify-between rounded-lg border p-4"
								>
									<div>
										<p className="font-medium">{cb.ownerName || cb.ownerEmail}</p>
										<p className="text-sm text-muted-foreground">{cb.ownerEmail}</p>
									</div>
									<p className="text-xl font-bold text-amber-600">
										{formatCurrency(cb.totalDebt)}
									</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
