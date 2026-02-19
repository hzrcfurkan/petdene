"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { useCreateVaccination, useUpdateVaccination, type Vaccination } from "@/lib/react-query/hooks/vaccinations"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { fetcher } from "@/lib/react-query/fetcher"
import { useQuery } from "@tanstack/react-query"
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
	const { mutate: createVaccination } = useCreateVaccination()
	const { mutate: updateVaccination } = useUpdateVaccination()

	// Fetch pets (filtered by owner if customer)
	const { data: petsData } = useQuery({
		queryKey: ["pets", currentUser?.role === "CUSTOMER" ? currentUser.id : undefined],
		queryFn: () => fetcher<{ pets: any[] }>(
			`/api/v1/pets?limit=100${currentUser?.role === "CUSTOMER" ? `&ownerId=${currentUser.id}` : ""}`
		),
		enabled: !!currentUser,
	})

	const pets = petsData?.pets || []

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
				await updateVaccination({ id: vaccination.id, data })
				toast.success("Vaccination updated successfully")
			} else {
				await createVaccination(data)
				toast.success("Vaccination created successfully")
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
					<Label htmlFor="petId">Pet *</Label>
					<Select value={petId} onValueChange={setPetId} required>
						<SelectTrigger id="petId">
							<SelectValue placeholder="Select a pet" />
						</SelectTrigger>
						<SelectContent>
							{pets.map((pet) => (
								<SelectItem key={pet.id} value={pet.id}>
									{pet.name} ({pet.species})
								</SelectItem>
							))}
						</SelectContent>
					</Select>
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
					<Label htmlFor="nextDue">Next Due Date</Label>
					<DatePicker
						id="nextDue"
						value={nextDue}
						onChange={setNextDue}
						placeholder="Select next due date"
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="notes">Notes</Label>
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
					{isSubmitting ? "Saving..." : vaccination ? "Update" : "Create"} Vaccination
				</Button>
			</div>
		</form>
	)
}

