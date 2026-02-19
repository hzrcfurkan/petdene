"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { useCreatePet, useUpdatePet, type Pet } from "@/lib/react-query/hooks/pets"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { fetcher } from "@/lib/react-query/fetcher"
import { useQuery } from "@tanstack/react-query"
import { currentUserClient } from "@/lib/auth/client"
import ImageUpload from "@/components/features/profile/ImageUpload"

interface PetFormProps {
	pet?: Pet | null
	onSuccess: () => void
	onCancel: () => void
}

const speciesOptions = ["Dog", "Cat", "Bird", "Rabbit", "Hamster", "Fish", "Other"]
const genderOptions = ["Male", "Female"]

export function PetForm({ pet, onSuccess, onCancel }: PetFormProps) {
	const [name, setName] = useState(pet?.name || "")
	const [species, setSpecies] = useState(pet?.species || "")
	const [breed, setBreed] = useState(pet?.breed || "")
	const [gender, setGender] = useState(pet?.gender || "")
	const [age, setAge] = useState(pet?.age?.toString() || "")
	const [dateOfBirth, setDateOfBirth] = useState(
		pet?.dateOfBirth ? new Date(pet.dateOfBirth).toISOString().split("T")[0] : ""
	)
	const [weight, setWeight] = useState(pet?.weight?.toString() || "")
	const [color, setColor] = useState(pet?.color || "")
	const [image, setImage] = useState(pet?.image || "")
	const [notes, setNotes] = useState(pet?.notes || "")
	const [ownerId, setOwnerId] = useState(pet?.ownerId || "")
	const [isSubmitting, setIsSubmitting] = useState(false)

	const currentUser = currentUserClient()
	const { mutate: createPet } = useCreatePet()
	const { mutate: updatePet } = useUpdatePet()

	// Fetch users for owner selection (admin/staff only)
	const { data: usersData } = useQuery({
		queryKey: ["admin", "users"],
		queryFn: () => fetcher<{ users: any[] }>("/api/v1/admin/users?role=CUSTOMER&limit=100"),
		enabled: currentUser ? (currentUser.isAdmin || currentUser.isSuperAdmin || currentUser.isStaff) : false,
	})

	const users = usersData?.users || []

	useEffect(() => {
		if (currentUser?.role === "CUSTOMER" && !pet) {
			setOwnerId(currentUser.id)
		}
	}, [currentUser, pet])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)

		try {
			const data: any = {
				name,
				species,
				breed: breed || undefined,
				gender: gender || undefined,
				age: age ? Number.parseInt(age) : undefined,
				dateOfBirth: dateOfBirth || undefined,
				weight: weight ? Number.parseFloat(weight) : undefined,
				color: color || undefined,
				image: image || undefined,
				notes: notes || undefined,
			}

			// Only admin/staff can set ownerId
			if ((currentUser?.isAdmin || currentUser?.isSuperAdmin || currentUser?.isStaff) && ownerId) {
				data.ownerId = ownerId
			}

			if (pet) {
				await updatePet({ id: pet.id, data })
				toast.success("Pet updated successfully")
			} else {
				await createPet(data)
				toast.success("Pet created successfully")
			}
			onSuccess()
		} catch (error: any) {
			toast.error(error?.info?.error || "Failed to save pet")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="name">Name *</Label>
					<Input
						id="name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						placeholder="Pet name"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="species">Species *</Label>
					<Select value={species} onValueChange={setSpecies} required>
						<SelectTrigger id="species">
							<SelectValue placeholder="Select species" />
						</SelectTrigger>
						<SelectContent>
							{speciesOptions.map((spec) => (
								<SelectItem key={spec} value={spec}>
									{spec}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="breed">Breed</Label>
					<Input
						id="breed"
						value={breed}
						onChange={(e) => setBreed(e.target.value)}
						placeholder="e.g., Golden Retriever"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="gender">Gender</Label>
					<Select value={gender || undefined} onValueChange={(value) => setGender(value || "")}>
						<SelectTrigger id="gender">
							<SelectValue placeholder="Select gender" />
						</SelectTrigger>
						<SelectContent>
							{genderOptions.map((gen) => (
								<SelectItem key={gen} value={gen}>
									{gen}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="age">Age (years)</Label>
					<Input
						id="age"
						type="number"
						min="0"
						value={age}
						onChange={(e) => setAge(e.target.value)}
						placeholder="Age in years"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="dateOfBirth">Date of Birth</Label>
					<DatePicker
						id="dateOfBirth"
						value={dateOfBirth}
						onChange={setDateOfBirth}
						placeholder="Select date of birth"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="weight">Weight (kg)</Label>
					<Input
						id="weight"
						type="number"
						step="0.1"
						min="0"
						value={weight}
						onChange={(e) => setWeight(e.target.value)}
						placeholder="Weight in kg"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="color">Color</Label>
					<Input
						id="color"
						value={color}
						onChange={(e) => setColor(e.target.value)}
						placeholder="e.g., Brown, Black, White"
					/>
				</div>

				{(currentUser?.isAdmin || currentUser?.isSuperAdmin || currentUser?.isStaff) && (
					<div className="space-y-2">
						<Label htmlFor="ownerId">Owner</Label>
						<Select value={ownerId} onValueChange={setOwnerId}>
							<SelectTrigger id="ownerId">
								<SelectValue placeholder="Select owner" />
							</SelectTrigger>
							<SelectContent>
								{users.map((user) => (
									<SelectItem key={user.id} value={user.id}>
										{user.name || user.email}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				<div className="space-y-2">
					<Label>Pet Image</Label>
					<ImageUpload
						value={image}
						onChange={setImage}
						showReuse={true}
						imgHeight={200}
						imgWidth="100%"
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="notes">Notes</Label>
				<Textarea
					id="notes"
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					placeholder="Additional notes about the pet..."
					rows={3}
				/>
			</div>

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Saving..." : pet ? "Update" : "Create"} Pet
				</Button>
			</div>
		</form>
	)
}

