"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { TrendingUp, TrendingDown, DollarSign, Calendar, Users, AlertCircle } from "lucide-react"

interface AnalyticsCardProps {
	title: string
	value: string | number
	change?: number
	changeLabel?: string
	icon?: React.ReactNode
	description?: string
}

export function AnalyticsCard({ title, value, change, changeLabel, icon, description }: AnalyticsCardProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				{icon}
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value}</div>
				{description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
				{change !== undefined && (
					<div className="flex items-center gap-1 mt-2">
						{change >= 0 ? (
							<TrendingUp className="h-3 w-3 text-green-600" />
						) : (
							<TrendingDown className="h-3 w-3 text-red-600" />
						)}
						<span className={`text-xs ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
							{Math.abs(change)}% {changeLabel || "from last period"}
						</span>
					</div>
				)}
			</CardContent>
		</Card>
	)
}

interface RecentTableProps {
	title: string
	data: any[]
	columns: { key: string; label: string; render?: (item: any) => React.ReactNode }[]
	emptyMessage?: string
}

export function RecentTable({ title, data, columns, emptyMessage = "No data available" }: RecentTableProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent>
				{data.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">{emptyMessage}</div>
				) : (
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									{columns.map((col) => (
										<TableHead key={col.key}>{col.label}</TableHead>
									))}
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.slice(0, 5).map((item, index) => (
									<TableRow key={index}>
										{columns.map((col) => (
											<TableCell key={col.key}>
												{col.render ? col.render(item) : item[col.key]}
											</TableCell>
										))}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
		</Card>
	)
}

interface AlertCardProps {
	type: "warning" | "info" | "success" | "error"
	title: string
	items: string[]
}

export function AlertCard({ type, title, items }: AlertCardProps) {
	const colors = {
		warning: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800",
		info: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
		success: "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
		error: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
	}

	return (
		<Card className={colors[type]}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-sm">
					<AlertCircle className="h-4 w-4" />
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ul className="list-disc list-inside space-y-1 text-sm">
					{items.map((item, index) => (
						<li key={index}>{item}</li>
					))}
				</ul>
			</CardContent>
		</Card>
	)
}

