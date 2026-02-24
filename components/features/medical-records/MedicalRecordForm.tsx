"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { useCreateMedicalRecord, useUpdateMedicalRecord, type MedicalRecord } from "@/lib/react-query/hooks/medical-records"
import { toast } from "sonner"
import { useState } from "react"
import { fetcher } from "@/lib/react-query/fetcher"
import { useQuery } from "@tanstack/react-query"
import { currentUserClient } from "@/lib/auth/client"

interface MedicalRecordFormProps {
	medicalRecord?: MedicalRecord | null
	onSuccess: () => void
	onCancel: () => void
}

export function MedicalRecordForm({ medicalRecord, onSuccess, onCancel }: MedicalRecordFormProps) {
	const [petId, setPetId] = useState(medicalRecord?.petId || "")
	const [title, setTitle] = useState(medicalRecord?.title || "")
	const [description, setDescription] = useState(medicalRecord?.description || "")
	const [diagnosis, setDiagnosis] = useState(medicalRecord?.diagnosis || "")
	const [treatment, setTreatment] = useState(medicalRecord?.treatment || "")
	const [date, setDate] = useState(
		medicalRecord?.date ? new Date(medicalRecord.date).toISOString().split("T")[0] : ""
	)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const currentUser = currentUserClient()
	const { mutate: createMedicalRecord } = useCreateMedicalRecord()
	const { mutate: updateMedicalRecord } = useUpdateMedicalRecord()

	// Fetch pets (admin/staff can see all pets)
	const { data: petsData } = useQuery({
		queryKey: ["pets"],
		queryFn: () => fetcher<{ pets: any[] }>("/api/v1/pets?limit=100"),
		enabled: !!currentUser,
	})

	const pets = petsData?.pets || []

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)

		try {
			const data = {
				petId,
				title,
				description: description || undefined,
				diagnosis: diagnosis || undefined,
				treatment: treatment || undefined,
				date: date ? new Date(date).toISOString() : undefined,
			}

			if (medicalRecord) {
				updateMedicalRecord(
					{ id: medicalRecord.id, data },
					{
						onSuccess: () => {
							toast.success("Medical record updated successfully")
							onSuccess()
						},
						onError: (error: any) => {
							toast.error(error?.info?.error || "Failed to update medical record")
						},
					}
				)
			} else {
				createMedicalRecord(data, {
					onSuccess: () => {
						toast.success("Medical record created successfully")
						onSuccess()
					},
					onError: (error: any) => {
						toast.error(error?.info?.error || "Failed to create medical record")
					},
				})
			}
		} catch (error: any) {
			toast.error(error?.info?.error || "Failed to save medical record")
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
					<Label htmlFor="title">Title *</Label>
					<Input
						id="title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						required
						placeholder="e.g., Annual Checkup, Vaccination Visit"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="date">Date</Label>
					<DatePicker
						id="date"
						value={date}
						onChange={setDate}
						placeholder="Select date"
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="General description of the visit or condition..."
					rows={3}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="diagnosis">Diagnosis</Label>
				<Input
					id="diagnosis"
					value={diagnosis}
					onChange={(e) => setDiagnosis(e.target.value)}
					placeholder="e.g., Healthy, Upper Respiratory Infection"
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="treatment">Treatment</Label>
				<Textarea
					id="treatment"
					value={treatment}
					onChange={(e) => setTreatment(e.target.value)}
					placeholder="Treatment plan, medications prescribed, follow-up instructions..."
					rows={4}
				/>
			</div>

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Saving..." : medicalRecord ? "Update" : "Create"} Medical Record
				</Button>
			</div>
		</form>
	)
}

