"use client"

import { MedicalRecordList } from "./MedicalRecordList"
import { PetTimeline } from "./PetTimeline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMedicalRecords } from "@/lib/react-query/hooks/medical-records"
import { Stethoscope, Calendar, Clock } from "lucide-react"
import { currentUserClient } from "@/lib/auth/client"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { fetcher } from "@/lib/react-query/fetcher"
import { useQuery } from "@tanstack/react-query"

export function MedicalRecordManagement() {
	const currentUser = currentUserClient()
	const isAdmin = currentUser && (currentUser.isAdmin || currentUser.isSuperAdmin || currentUser.isStaff)
	const [selectedPetId, setSelectedPetId] = useState<string>("")

	const { data: allData } = useMedicalRecords({ limit: 1000, sort: "date-desc" })
	const { data: recentData } = useMedicalRecords({ limit: 100, sort: "date-desc" })

	const allRecords = allData?.records || []
	const recentRecords = recentData?.records || []

	// Fetch pets for timeline filter (admin/staff can see all, customers see only their pets)
	const { data: petsData } = useQuery({
		queryKey: ["pets", currentUser?.role === "CUSTOMER" ? currentUser.id : undefined],
		queryFn: () => fetcher<{ pets: any[] }>(
			`/api/v1/pets?limit=100${currentUser?.role === "CUSTOMER" ? `&ownerId=${currentUser.id}` : ""}`
		),
		enabled: !!currentUser,
	})

	const pets = petsData?.pets || []

	// Calculate stats (only for admin/staff)
	const now = new Date()
	const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

	const stats = {
		total: allRecords.length,
		recent: recentRecords.filter((r) => new Date(r.date) >= thirtyDaysAgo).length,
		thisMonth: allRecords.filter((r) => {
			const recordDate = new Date(r.date)
			return (
				recordDate.getMonth() === now.getMonth() &&
				recordDate.getFullYear() === now.getFullYear()
			)
		}).length,
		withDiagnosis: allRecords.filter((r) => r.diagnosis).length,
	}

	return (
		<div className="space-y-6">
			{/* Stats Cards - Only show for admin/staff */}
			{isAdmin && (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Records</CardTitle>
							<Stethoscope className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.total}</div>
							<p className="text-xs text-muted-foreground">All medical records</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">This Month</CardTitle>
							<Calendar className="h-4 w-4 text-blue-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.thisMonth}</div>
							<p className="text-xs text-muted-foreground">Records this month</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Recent (30 days)</CardTitle>
							<Calendar className="h-4 w-4 text-green-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.recent}</div>
							<p className="text-xs text-muted-foreground">Last 30 days</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">With Diagnosis</CardTitle>
							<Stethoscope className="h-4 w-4 text-purple-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.withDiagnosis}</div>
							<p className="text-xs text-muted-foreground">Records with diagnosis</p>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Tabs - Only show for admin/staff */}
			{isAdmin ? (
				<Tabs defaultValue="all" className="space-y-4">
					<TabsList>
						<TabsTrigger value="all">All Records</TabsTrigger>
						<TabsTrigger value="recent">Recent (30 days)</TabsTrigger>
						<TabsTrigger value="timeline">Timeline View</TabsTrigger>
					</TabsList>

					<TabsContent value="all" className="space-y-4">
						<MedicalRecordList showActions={true} />
					</TabsContent>

					<TabsContent value="recent" className="space-y-4">
						<MedicalRecordList
							dateFrom={thirtyDaysAgo.toISOString().split("T")[0]}
							showActions={true}
						/>
					</TabsContent>

					<TabsContent value="timeline" className="space-y-4">
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardTitle className="flex items-center gap-2">
											<Clock className="w-5 h-5" />
											Complete Medical History Timeline
										</CardTitle>
										<p className="text-sm text-muted-foreground mt-1">
											View all medical records, vaccinations, and prescriptions in chronological order
										</p>
									</div>
									<div className="w-[250px]">
										<Label htmlFor="pet-select" className="text-xs mb-2 block">Filter by Pet (Optional)</Label>
										<Select value={selectedPetId || "all"} onValueChange={(value) => setSelectedPetId(value === "all" ? "" : value)}>
											<SelectTrigger id="pet-select">
												<SelectValue placeholder="All Pets" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">All Pets</SelectItem>
												{pets.map((pet) => (
													<SelectItem key={pet.id} value={pet.id}>
														{pet.name} ({pet.species})
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<PetTimeline petId={selectedPetId || undefined} />
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			) : (
				/* Customer view - show timeline for their pets */
				<Tabs defaultValue="list" className="space-y-4">
					<TabsList>
						<TabsTrigger value="list">Records List</TabsTrigger>
						<TabsTrigger value="timeline">Timeline View</TabsTrigger>
					</TabsList>

					<TabsContent value="list" className="space-y-4">
						<MedicalRecordList showActions={false} />
					</TabsContent>

					<TabsContent value="timeline" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Clock className="w-5 h-5" />
									Complete Medical History
								</CardTitle>
								<p className="text-sm text-muted-foreground mt-1">
									View all medical records, vaccinations, and prescriptions for your pets
								</p>
							</CardHeader>
							<CardContent>
								<PetTimeline />
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			)}
		</div>
	)
}

