"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { SearchSelect } from "@/components/ui/search-select"
import { useCreatePrescription, useUpdatePrescription, type Prescription } from "@/lib/react-query/hooks/prescriptions"
import { usePets } from "@/lib/react-query/hooks/pets"
import { toast } from "sonner"
import { useState } from "react"
import { currentUserClient } from "@/lib/auth/client"

interface PrescriptionFormProps {
	prescription?: Prescription | null
	onSuccess: () => void
	onCancel: () => void
}

export function PrescriptionForm({ prescription, onSuccess, onCancel }: PrescriptionFormProps) {
	const [petId, setPetId] = useState(prescription?.petId || "")
	const [medicineName, setMedicineName] = useState(prescription?.medicineName || "")
	const [dosage, setDosage] = useState(prescription?.dosage || "")
	const [instructions, setInstructions] = useState(prescription?.instructions || "")
	const [dateIssued, setDateIssued] = useState(
		prescription?.dateIssued ? new Date(prescription.dateIssued).toISOString().split("T")[0] : ""
	)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const currentUser = currentUserClient()
	const [petSearch, setPetSearch] = useState("")
	const { mutate: createPrescription } = useCreatePrescription()
	const { mutate: updatePrescription } = useUpdatePrescription()

	// Fetch pets with search (patient name, owner name/email)
	const { data: petsData, isLoading: isLoadingPets } = usePets({
		limit: 100,
		sort: "name-asc",
		search: petSearch || undefined,
		ownerId: currentUser?.role === "CUSTOMER" ? currentUser.id : undefined,
	})

	const pets = petsData?.pets || []
	const petOptions = pets.map((pet) => ({
		value: pet.id,
		label: `${pet.name} (${pet.species})${pet.patientNumber ? ` • ${pet.patientNumber}` : ""}`,
		subLabel: pet.owner ? `${pet.owner.name || pet.owner.email}` : undefined,
	}))

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)

		try {
			const data = {
				petId,
				medicineName,
				dosage: dosage || undefined,
				instructions: instructions || undefined,
				dateIssued: dateIssued ? new Date(dateIssued).toISOString() : undefined,
			}

			if (prescription) {
				await updatePrescription({ id: prescription.id, data })
				toast.success("Prescription updated successfully")
			} else {
				await createPrescription(data)
				toast.success("Reçete başarıyla oluşturuldu")
			}
			onSuccess()
		} catch (error: any) {
			toast.error(error?.info?.error || "Failed to save prescription")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="petId">Patient (Pet) *</Label>
					<SearchSelect
						options={petOptions}
						value={petId}
						onValueChange={setPetId}
						placeholder="Search by patient or owner name..."
						searchPlaceholder="Search by patient name, owner name, or email..."
						emptyText={isLoadingPets ? "Yükleniyor..." : "No patients found. Try a different search."}
						onSearchChange={setPetSearch}
						loading={isLoadingPets}
						renderOption={(opt) => {
							const pet = pets.find((p) => p.id === opt.value)
							return (
								<div className="flex flex-col">
									<span>{pet?.name} ({pet?.species})</span>
									{pet?.owner && (
										<span className="text-xs text-muted-foreground">
											Owner: {pet.owner.name || pet.owner.email}
										</span>
									)}
								</div>
							)
						}}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="medicineName">Medicine Name *</Label>
					<Input
						id="medicineName"
						value={medicineName}
						onChange={(e) => setMedicineName(e.target.value)}
						required
						placeholder="e.g., Amoxicillin, Metronidazole"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="dosage">Dosage</Label>
					<Input
						id="dosage"
						value={dosage}
						onChange={(e) => setDosage(e.target.value)}
						placeholder="e.g., 250mg twice daily"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="dateIssued">Date Issued</Label>
					<DatePicker
						id="dateIssued"
						value={dateIssued}
						onChange={setDateIssued}
						placeholder="Select date issued"
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="instructions">Instructions</Label>
				<Textarea
					id="instructions"
					value={instructions}
					onChange={(e) => setInstructions(e.target.value)}
					placeholder="Administration instructions for the medication..."
					rows={3}
				/>
			</div>

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Kaydediliyor..." : prescription ? "Güncelle" : "Oluştur"} Prescription
				</Button>
			</div>
		</form>
	)
}

