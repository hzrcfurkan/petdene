"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts"

interface ChartData {
	name: string
	value: number
	[key: string]: string | number
}

interface DashboardChartsProps {
	appointmentsData?: ChartData[]
	revenueData?: ChartData[]
	statusData?: ChartData[]
	serviceData?: ChartData[]
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export function DashboardCharts({
	appointmentsData = [],
	revenueData = [],
	statusData = [],
	serviceData = [],
}: DashboardChartsProps) {
	return (
		<div className="grid gap-4 md:grid-cols-3">
			{/* Appointments Over Time */}
			{appointmentsData.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Appointments Over Time</CardTitle>
						<CardDescription>Appointment trends by date</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={300}>
							<LineChart data={appointmentsData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip />
								<Legend />
								<Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
							</LineChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			)}

			{/* Revenue Chart */}
			{revenueData.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Revenue Overview</CardTitle>
						<CardDescription>Revenue by period</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={revenueData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
								<Legend />
								<Bar dataKey="value" fill="#10b981" />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			)}

			{/* Status Distribution */}
			{statusData.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Status Distribution</CardTitle>
						<CardDescription>Distribution of appointment statuses</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={300}>
							<PieChart>
								<Pie
									data={statusData}
									cx="50%"
									cy="50%"
									labelLine={false}
									label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
									outerRadius={80}
									fill="#8884d8"
									dataKey="value"
								>
									{statusData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
									))}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			)}

			{/* Service Popularity */}
			{serviceData.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Service Popularity</CardTitle>
						<CardDescription>Most booked services</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={serviceData} layout="vertical">
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis type="number" />
								<YAxis dataKey="name" type="category" width={100} />
								<Tooltip />
								<Legend />
								<Bar dataKey="value" fill="#8b5cf6" />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			)}
		</div>
	)
}

