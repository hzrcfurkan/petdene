"use client"

import { VaccinationList } from "./VaccinationList"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useVaccinations } from "@/lib/react-query/hooks/vaccinations"
import { Syringe, AlertCircle, CheckCircle, CalendarClock, TrendingUp, Clock } from "lucide-react"

export function VaccinationManagement() {
	const { data: realData }    = useVaccinations({ limit: 1000, isPlanned: false })
	const { data: plannedData } = useVaccinations({ limit: 1000, isPlanned: true })

	const realVaccinations    = realData?.vaccinations    || []
	const plannedVaccinations = plannedData?.vaccinations || []

	const now = new Date()
	const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

	const stats = {
		total:    realVaccinations.length,
		planned:  plannedVaccinations.length,
		due:      realVaccinations.filter(v => v.nextDue && new Date(v.nextDue) < now).length,
		upcoming: realVaccinations.filter(v => v.nextDue && new Date(v.nextDue) >= now && new Date(v.nextDue) <= in30).length,
	}

	const statCards = [
		{
			label: "Toplam Aşı Kaydı",
			value: stats.total,
			sub: "Yapılmış aşılar",
			icon: Syringe,
			color: "text-violet-600",
			bg: "bg-violet-50 dark:bg-violet-950/30",
			border: "border-violet-100 dark:border-violet-900",
			iconBg: "bg-violet-100 dark:bg-violet-900",
		},
		{
			label: "Planlanmış Aşı",
			value: stats.planned,
			sub: "Bekleyen randevular",
			icon: CalendarClock,
			color: "text-blue-600",
			bg: "bg-blue-50 dark:bg-blue-950/30",
			border: "border-blue-100 dark:border-blue-900",
			iconBg: "bg-blue-100 dark:bg-blue-900",
		},
		{
			label: "Gecikmiş Hatırlatma",
			value: stats.due,
			sub: "Tarihi geçmiş",
			icon: AlertCircle,
			color: "text-red-600",
			bg: "bg-red-50 dark:bg-red-950/30",
			border: "border-red-100 dark:border-red-900",
			iconBg: "bg-red-100 dark:bg-red-900",
		},
		{
			label: "Yaklaşan",
			value: stats.upcoming,
			sub: "Sonraki 30 gün",
			icon: Clock,
			color: "text-amber-600",
			bg: "bg-amber-50 dark:bg-amber-950/30",
			border: "border-amber-100 dark:border-amber-900",
			iconBg: "bg-amber-100 dark:bg-amber-900",
		},
	]

	return (
		<div className="space-y-6">
			{/* Stat kartları */}
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{statCards.map((card) => {
					const Icon = card.icon
					return (
						<div
							key={card.label}
							className={`rounded-2xl border p-5 flex items-start gap-4 shadow-sm transition-shadow hover:shadow-md ${card.bg} ${card.border}`}
						>
							<div className={`rounded-xl p-2.5 shrink-0 ${card.iconBg}`}>
								<Icon className={`w-5 h-5 ${card.color}`} />
							</div>
							<div>
								<p className="text-xs font-medium text-muted-foreground mb-0.5">{card.label}</p>
								<p className={`text-3xl font-bold tracking-tight ${card.color}`}>{card.value}</p>
								<p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
							</div>
						</div>
					)
				})}
			</div>

			{/* Sekmeler */}
			<Tabs defaultValue="real" className="space-y-4">
				<div className="flex items-center">
					<TabsList className="h-10 p-1 bg-muted/60 rounded-xl gap-1">
						<TabsTrigger value="real" className="rounded-lg px-4 text-sm font-medium data-[state=active]:shadow-sm">
							<Syringe className="w-3.5 h-3.5 mr-1.5" />
							Yapılan Aşılar
							{stats.total > 0 && (
								<span className="ml-2 bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300 text-xs px-1.5 py-0.5 rounded-full font-semibold">
									{stats.total}
								</span>
							)}
						</TabsTrigger>

						<TabsTrigger value="planned" className="rounded-lg px-4 text-sm font-medium data-[state=active]:shadow-sm">
							<CalendarClock className="w-3.5 h-3.5 mr-1.5" />
							Planlamalar
							{stats.planned > 0 && (
								<span className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs px-1.5 py-0.5 rounded-full font-semibold">
									{stats.planned}
								</span>
							)}
						</TabsTrigger>

						<TabsTrigger value="upcoming" className="rounded-lg px-4 text-sm font-medium data-[state=active]:shadow-sm">
							<Clock className="w-3.5 h-3.5 mr-1.5" />
							Yaklaşan
							{stats.upcoming > 0 && (
								<span className="ml-2 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 text-xs px-1.5 py-0.5 rounded-full font-semibold">
									{stats.upcoming}
								</span>
							)}
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value="real">
					<VaccinationList showActions={true} isPlanned={false} />
				</TabsContent>

				<TabsContent value="planned">
					<VaccinationList showActions={true} isPlanned={true} />
				</TabsContent>

				<TabsContent value="upcoming">
					<VaccinationList upcoming={true} showActions={true} />
				</TabsContent>
			</Tabs>
		</div>
	)
}
