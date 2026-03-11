"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrency } from "@/components/providers/CurrencyProvider"
import {
	ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart"
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Line,
	LineChart,
	Pie,
	PieChart,
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

const CHART_COLORS = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)",
] as const

const appointmentsChartConfig = {
	value: {
		label: "Randevular",
		color: "var(--chart-1)",
	},
	name: {
		label: "Tarih",
	},
} satisfies ChartConfig

const revenueChartConfig = {
	value: {
		label: "Gelir",
		color: "var(--chart-2)",
	},
	name: {
		label: "Period",
	},
} satisfies ChartConfig

const createStatusChartConfig = (statusData: ChartData[]) =>
	({
		value: { label: "Count", color: "var(--chart-1)" },
		...Object.fromEntries(
			statusData.map((item, i) => [
				item.name,
				{ label: item.name, color: CHART_COLORS[i % CHART_COLORS.length] },
			])
		),
	}) satisfies ChartConfig

const serviceChartConfig = {
	value: {
		label: "Bookings",
		color: "var(--chart-4)",
	},
	name: {
		label: "Service",
	},
} satisfies ChartConfig

export function DashboardCharts({
	appointmentsData = [],
	revenueData = [],
	statusData = [],
	serviceData = [],
}: DashboardChartsProps) {
	const { formatCurrency } = useCurrency()
	return (
		<div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"20px"}}>
			{/* Appointments Over Time */}
			{appointmentsData.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Zaman İçinde Randevular</CardTitle>
						<CardDescription>Tarihe göre randevu trendleri</CardDescription>
					</CardHeader>
					<CardContent>
						<ChartContainer
							config={appointmentsChartConfig}
							className="aspect-auto h-[340px] w-full"
						>
							<LineChart
								data={appointmentsData}
								margin={{ left: 12, right: 12, top: 12, bottom: 0 }}
							>
								<CartesianGrid strokeDasharray="3 3" vertical={false} />
								<XAxis
									dataKey="name"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
								/>
								<YAxis hide />
								<ChartTooltip content={<ChartTooltipContent indicator="line" />} />
								<ChartLegend content={<ChartLegendContent />} />
								<Line
									type="monotone"
									dataKey="value"
									stroke="var(--color-value)"
									strokeWidth={2}
									dot={{ fill: "var(--color-value)", r: 3 }}
									activeDot={{ r: 5 }}
								/>
							</LineChart>
						</ChartContainer>
					</CardContent>
				</Card>
			)}

			{/* Revenue Chart */}
			{revenueData.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Gelir Genel Bakış</CardTitle>
						<CardDescription>Döneme göre gelir</CardDescription>
					</CardHeader>
					<CardContent>
						<ChartContainer
							config={revenueChartConfig}
							className="aspect-auto h-[340px] w-full"
						>
							<BarChart
								data={revenueData}
								margin={{ left: 12, right: 12, top: 12, bottom: 0 }}
							>
								<CartesianGrid strokeDasharray="3 3" vertical={false} />
								<XAxis
									dataKey="name"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
								/>
								<YAxis hide />
								<ChartTooltip
									content={
										<ChartTooltipContent
											formatter={(value, name, item) => (
												<>
													<div
														className="shrink-0 rounded-[2px] h-2.5 w-2.5"
														style={{
															backgroundColor:
																item.color || (item.payload as { fill?: string })?.fill || "var(--chart-2)",
														}}
													/>
													<div className="flex flex-1 justify-between leading-none items-center">
														<span className="text-muted-foreground">{name}</span>
														<span className="text-foreground font-mono font-medium tabular-nums">
															{formatCurrency(Number(value))}
														</span>
													</div>
												</>
											)}
										/>
									}
								/>
								<ChartLegend content={<ChartLegendContent />} />
								<Bar
									dataKey="value"
									fill="var(--color-value)"
									radius={[4, 4, 0, 0]}
								/>
							</BarChart>
						</ChartContainer>
					</CardContent>
				</Card>
			)}

			{/* Status Distribution */}
			{statusData.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Durum Dağılımı</CardTitle>
						<CardDescription>Randevu durumlarının dağılımı</CardDescription>
					</CardHeader>
					<CardContent>
						<ChartContainer
							config={createStatusChartConfig(statusData)}
							className="aspect-auto h-[340px] w-full"
						>
							<PieChart>
								<ChartTooltip
									content={
										<ChartTooltipContent
											hideIndicator
											formatter={(value, name) => {
												const total = statusData.reduce((a, b) => a + b.value, 0)
												const numVal = typeof value === "number" ? value : Number(value)
												const pct = total > 0 ? Math.round((numVal / total) * 100) : 0
												return (
													<div className="flex flex-1 justify-between leading-none items-center">
														<span className="text-muted-foreground">{name}</span>
														<span className="text-foreground font-mono font-medium tabular-nums">
															{numVal} ({pct}%)
														</span>
													</div>
												)
											}}
										/>
									}
								/>
								<Pie
									data={statusData}
									cx="50%"
									cy="50%"
									innerRadius={50}
									outerRadius={90}
									paddingAngle={2}
									dataKey="value"
									nameKey="name"
									strokeWidth={1}
									stroke="var(--border)"
								>
									{statusData.map((_, index) => (
										<Cell
											key={`cell-${index}`}
											fill={CHART_COLORS[index % CHART_COLORS.length]}
										/>
									))}
								</Pie>
								<ChartLegend content={<ChartLegendContent nameKey="name" />} />
							</PieChart>
						</ChartContainer>
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
						<ChartContainer
							config={serviceChartConfig}
							className="aspect-auto h-[340px] w-full"
						>
							<BarChart
								data={serviceData}
								layout="vertical"
								margin={{ left: 12, right: 12, top: 0, bottom: 0 }}
							>
								<CartesianGrid strokeDasharray="3 3" horizontal={false} />
								<XAxis type="number" tickLine={false} axisLine={false} />
								<YAxis
									dataKey="name"
									type="category"
									width={100}
									tickLine={false}
									axisLine={false}
									tickMargin={8}
								/>
								<ChartTooltip content={<ChartTooltipContent />} />
								<ChartLegend content={<ChartLegendContent />} />
								<Bar
									dataKey="value"
									fill="var(--color-value)"
									radius={[0, 4, 4, 0]}
								/>
							</BarChart>
						</ChartContainer>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
