"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PawPrint, Calendar, User, Mail, Phone, FileText, Heart, Pill, Stethoscope } from "lucide-react"
import { format } from "date-fns"
import { type Pet } from "@/lib/react-query/hooks/pets"
import { usePet } from "@/lib/react-query/hooks/pets"

interface PetDetailProps {
	pet: Pet
}

export function PetDetail({ pet: initialPet }: PetDetailProps) {
	const { data: petData } = usePet(initialPet.id)
	const pet = petData || initialPet

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					{pet.image && (
						<img
							src={pet.image}
							alt={pet.name}
							className="w-16 h-16 rounded-full object-cover"
						/>
					)}
					<div>
						<CardTitle className="text-2xl">{pet.name}</CardTitle>
						<CardDescription className="flex items-center gap-2 mt-1">
							<PawPrint className="w-4 h-4" />
							{pet.species}
							{pet.breed && ` • ${pet.breed}`}
						</CardDescription>
					</div>
				</div>
				<Badge variant="outline" className="text-lg px-3 py-1">
					{pet.species}
				</Badge>
			</div>

			<Separator />

			<div className="grid gap-4 md:grid-cols-2">
				{/* Basic Information */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium">Basic Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{pet.gender && (
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">Gender:</span>
								<span className="text-sm font-medium">{pet.gender}</span>
							</div>
						)}
						{pet.age && (
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">Age:</span>
								<span className="text-sm font-medium">{pet.age} years</span>
							</div>
						)}
						{pet.dateOfBirth && (
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">Date of Birth:</span>
								<span className="text-sm font-medium flex items-center gap-1">
									<Calendar className="w-3 h-3" />
									{format(new Date(pet.dateOfBirth), "MMM dd, yyyy")}
								</span>
							</div>
						)}
						{pet.weight && (
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">Weight:</span>
								<span className="text-sm font-medium">{pet.weight} kg</span>
							</div>
						)}
						{pet.color && (
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">Color:</span>
								<span className="text-sm font-medium">{pet.color}</span>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Owner Information */}
				{pet.owner && (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium flex items-center gap-2">
								<User className="w-4 h-4" />
								Owner
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">Name:</span>
								<span className="text-sm font-medium">{pet.owner.name || "N/A"}</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm text-muted-foreground">Email:</span>
								<span className="text-sm font-medium flex items-center gap-1">
									<Mail className="w-3 h-3" />
									{pet.owner.email}
								</span>
							</div>
							{pet.owner.phone && (
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Phone:</span>
									<span className="text-sm font-medium flex items-center gap-1">
										<Phone className="w-3 h-3" />
										{pet.owner.phone}
									</span>
								</div>
							)}
						</CardContent>
					</Card>
				)}

				{/* Medical Records Summary */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<Stethoscope className="w-4 h-4" />
							Medical Records
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">Appointments:</span>
								<span className="text-sm font-medium">{pet._count?.appointments || 0}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">Vaccinations:</span>
								<span className="text-sm font-medium">{pet._count?.vaccinations || 0}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">Medical Records:</span>
								<span className="text-sm font-medium">{pet._count?.medicalLogs || 0}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">Prescriptions:</span>
								<span className="text-sm font-medium">{pet._count?.prescriptions || 0}</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Notes */}
			{pet.notes && (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<FileText className="w-4 h-4" />
							Notes
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm whitespace-pre-wrap">{pet.notes}</p>
					</CardContent>
				</Card>
			)}

			{/* Timestamps */}
			<div className="text-xs text-muted-foreground pt-2">
				Created: {format(new Date(pet.createdAt), "MMM dd, yyyy HH:mm")}
				{pet.updatedAt !== pet.createdAt && (
					<> • Updated: {format(new Date(pet.updatedAt), "MMM dd, yyyy HH:mm")}</>
				)}
			</div>
		</div>
	)
}

