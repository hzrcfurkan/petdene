"use client"

import { VaccinationList } from "./VaccinationList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useVaccinations } from "@/lib/react-query/hooks/vaccinations"
import { Syringe, AlertCircle, CheckCircle, CalendarClock } from "lucide-react"

export function VaccinationManagement() {
	const { data: realData }     = useVaccinations({ limit: 1000, isPlanned: false })
	const { data: plannedData }  = useVaccinations({ limit: 1000, isPlanned: true })

	const realVaccinations    = realData?.vaccinations    || []
	const plannedVaccinations = plannedData?.vaccinations || []

	const now = new Date()
	const stats = {
		total:    realVaccinations.length,
		planned:  plannedVaccinations.length,
		due:      realVaccinations.filter(v => v.nextDue ? new Date(v.nextDue) < now : false).length,
		upcoming: realVaccinations.filter(v =>
			v.nextDue
				? new Date(v.nextDue) >= now &&
				  new Date(v.nextDue) <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
				: false
		).length,
	}

	return (
		<div className="space-y-6">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Toplam Aşı Kaydı</CardTitle>
						<Syringe className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.total}</div>
						<p className="text-xs text-muted-foreground">Yapılmış aşılar</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Planlanmış Aşı</CardTitle>
						<CalendarClock className="h-4 w-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-blue-600">{stats.planned}</div>
						<p className="text-xs text-muted-foreground">Bekleyen randevular</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Gecikmiş Hatırlatma</CardTitle>
						<AlertCircle className="h-4 w-4 text-red-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">{stats.due}</div>
						<p className="text-xs text-muted-foreground">Tarihi geçmiş</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Yaklaşan</CardTitle>
						<CheckCircle className="h-4 w-4 text-yellow-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.upcoming}</div>
						<p className="text-xs text-muted-foreground">Sonraki 30 gün</p>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="real" className="space-y-4">
				<TabsList>
					<TabsTrigger value="real">
						💉 Yapılan Aşılar
						{stats.total > 0 && <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-1.5 py-0.5 rounded-full">{stats.total}</span>}
					</TabsTrigger>
					<TabsTrigger value="planned">
						📅 Aşı Planlamaları
						{stats.planned > 0 && <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">{stats.planned}</span>}
					</TabsTrigger>
					<TabsTrigger value="upcoming">
						⏰ Yaklaşan Hatırlatmalar
						{stats.upcoming > 0 && <span className="ml-2 bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5 rounded-full">{stats.upcoming}</span>}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="real" className="space-y-4">
					<VaccinationList showActions={true} isPlanned={false} />
				</TabsContent>

				<TabsContent value="planned" className="space-y-4">
					<VaccinationList showActions={true} isPlanned={true} />
				</TabsContent>

				<TabsContent value="upcoming" className="space-y-4">
					<VaccinationList upcoming={true} showActions={true} isPlanned={false} />
				</TabsContent>
			</Tabs>
		</div>
	)
}
