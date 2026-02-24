"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AppointmentImport } from "@/components/features/appointments/AppointmentImport"
import { PetServiceImport } from "@/components/features/pet-services/PetServiceImport"
import { VaccinationImport } from "@/components/features/vaccinations/VaccinationImport"
import { PetImport } from "@/components/features/pets/PetImport"
import { Calendar, Sparkles, Syringe, PawPrint, Upload } from "lucide-react"

export function ImportManagement() {
	return (
		<div className="space-y-6">
			{/* Info Card */}
			<Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Upload className="w-5 h-5" />
						Import Instructions
					</CardTitle>
					<CardDescription>
						Upload CSV or Excel files to bulk import data. Make sure your files follow the required format.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
						<li>Supported formats: CSV (.csv) and Excel (.xlsx, .xls)</li>
						<li>First row should contain column headers</li>
						<li>Required fields vary by import type - check each tab for details</li>
						<li>Invalid rows will be skipped with error messages</li>
					</ul>
				</CardContent>
			</Card>

			{/* Import Tabs */}
			<Tabs defaultValue="appointments" className="space-y-4">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="appointments" className="flex items-center gap-2">
						<Calendar className="w-4 h-4" />
						Appointments
					</TabsTrigger>
					<TabsTrigger value="services" className="flex items-center gap-2">
						<Sparkles className="w-4 h-4" />
						Services
					</TabsTrigger>
					<TabsTrigger value="vaccinations" className="flex items-center gap-2">
						<Syringe className="w-4 h-4" />
						Vaccinations
					</TabsTrigger>
					<TabsTrigger value="pets" className="flex items-center gap-2">
						<PawPrint className="w-4 h-4" />
						Pets
					</TabsTrigger>
				</TabsList>

				<TabsContent value="appointments" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calendar className="w-5 h-5" />
								Import Appointments
							</CardTitle>
							<CardDescription>
								Bulk import appointments from CSV or Excel files. Required fields: Pet Name/ID, Service Title/ID, Date, Time
							</CardDescription>
						</CardHeader>
						<CardContent>
							<AppointmentImport />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="services" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Sparkles className="w-5 h-5" />
								Import Services
							</CardTitle>
							<CardDescription>
								Bulk import pet services from CSV or Excel files. Required fields: Title, Type, Price
							</CardDescription>
						</CardHeader>
						<CardContent>
							<PetServiceImport />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="vaccinations" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Syringe className="w-5 h-5" />
								Import Vaccinations
							</CardTitle>
							<CardDescription>
								Bulk import vaccination records from CSV or Excel files. Required fields: Pet Name/ID, Vaccine Name, Date Given
							</CardDescription>
						</CardHeader>
						<CardContent>
							<VaccinationImport />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="pets" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<PawPrint className="w-5 h-5" />
								Import Pets
							</CardTitle>
							<CardDescription>
								Bulk import pets from CSV or Excel files. Required fields: Owner Email, Name, Species
							</CardDescription>
						</CardHeader>
						<CardContent>
							<PetImport />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}

