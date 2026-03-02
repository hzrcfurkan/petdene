"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { SearchSelect } from "@/components/ui/search-select"
import { useCreateVaccination, useUpdateVaccination, type Vaccination } from "@/lib/react-query/hooks/vaccinations"
import { usePets } from "@/lib/react-query/hooks/pets"
import { toast } from "sonner"
import { useState } from "react"
import { currentUserClient } from "@/lib/auth/client"

interface VaccinationFormProps {
	vaccination?: Vaccination | null
	onSuccess: () => void
	onCancel: () => void
}

export function VaccinationForm({ vaccination, onSuccess, onCancel }: VaccinationFormProps) {
	const [petId, setPetId] = useState(vaccination?.petId || "")
	const [vaccineName, setVaccineName] = useState(vaccination?.vaccineName || "")
	const [dateGiven, setDateGiven] = useState(
		vaccination?.dateGiven ? new Date(vaccination.dateGiven).toISOString().split("T")[0] : ""
	)
	const [nextDue, setNextDue] = useState(
		vaccination?.nextDue ? new Date(vaccination.nextDue).toISOString().split("T")[0] : ""
	)
	const [notes, setNotes] = useState(vaccination?.notes || "")
	const [isSubmitting, setIsSubmitting] = useState(false)

	const currentUser = currentUserClient()
	const [petSearch, setPetSearch] = useState("")
	const createVaccinationMutation = useCreateVaccination()
	const updateVaccinationMutation = useUpdateVaccination()

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
				vaccineName,
				dateGiven: new Date(dateGiven).toISOString(),
				nextDue: nextDue ? new Date(nextDue).toISOString() : undefined,
				notes: notes || undefined,
			}

			if (vaccination) {
				await updateVaccinationMutation.mutateAsync({ id: vaccination.id, data })
				toast.success("Aşı başarıyla güncellendi")
			} else {
				await createVaccinationMutation.mutateAsync(data)
				toast.success("Aşı başarıyla oluşturuldu")
			}
			onSuccess()
		} catch (error: any) {
			toast.error(error?.info?.error || "Failed to save vaccination")
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
					<Label htmlFor="vaccineName">Vaccine Name *</Label>
					<Input
						id="vaccineName"
						value={vaccineName}
						onChange={(e) => setVaccineName(e.target.value)}
						required
						placeholder="e.g., Rabies, DHPP, FVRCP"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="dateGiven">Date Given *</Label>
					<DatePicker
						id="dateGiven"
						value={dateGiven}
						onChange={setDateGiven}
						placeholder="Select date given"
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="nextDue">Sonraki Aşı Tarihi</Label>
					<DatePicker
						id="nextDue"
						value={nextDue}
						onChange={setNextDue}
						placeholder="Select next due date"
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="notes">Notlar</Label>
				<Textarea
					id="notes"
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					placeholder="Additional notes about the vaccination..."
					rows={3}
				/>
			</div>

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Kaydediliyor..." : vaccination ? "Güncelle" : "Oluştur"} Vaccination
				</Button>
			</div>
		</form>
	)
}

