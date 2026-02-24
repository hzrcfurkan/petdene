"use client"

import { PetList } from "./PetList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePets } from "@/lib/react-query/hooks/pets"
import { PawPrint, Users, Calendar, Heart } from "lucide-react"

export function PetManagement() {
	const { data: allData } = usePets({ limit: 1000, sort: "date-desc" })

	const allPets = allData?.pets || []

	// Calculate stats
	const stats = {
		total: allPets.length,
		dogs: allPets.filter((p) => p.species === "Dog").length,
		cats: allPets.filter((p) => p.species === "Cat").length,
		others: allPets.filter((p) => !["Dog", "Cat"].includes(p.species)).length,
		withAppointments: allPets.filter((p) => (p._count?.appointments || 0) > 0).length,
	}

	return (
		<div className="space-y-6">
			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Pets</CardTitle>
						<PawPrint className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.total}</div>
						<p className="text-xs text-muted-foreground">All registered pets</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Dogs</CardTitle>
						<PawPrint className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.dogs}</div>
						<p className="text-xs text-muted-foreground">Dog pets</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Cats</CardTitle>
						<PawPrint className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.cats}</div>
						<p className="text-xs text-muted-foreground">Cat pets</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Others</CardTitle>
						<Heart className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.others}</div>
						<p className="text-xs text-muted-foreground">Other species</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">With Appointments</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.withAppointments}</div>
						<p className="text-xs text-muted-foreground">Pets with bookings</p>
					</CardContent>
				</Card>
			</div>

			{/* Pet List */}
			<PetList showActions={true} />
		</div>
	)
}

