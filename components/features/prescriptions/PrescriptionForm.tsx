"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { useCreatePrescription, useUpdatePrescription, type Prescription } from "@/lib/react-query/hooks/prescriptions"
import { toast } from "sonner"
import { useState } from "react"
import { fetcher } from "@/lib/react-query/fetcher"
import { useQuery } from "@tanstack/react-query"
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
	const { mutate: createPrescription } = useCreatePrescription()
	const { mutate: updatePrescription } = useUpdatePrescription()

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
				toast.success("Prescription created successfully")
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
					{isSubmitting ? "Saving..." : prescription ? "Update" : "Create"} Prescription
				</Button>
			</div>
		</form>
	)
}

