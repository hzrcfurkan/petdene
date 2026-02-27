"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { SearchSelect, type SearchSelectOption } from "@/components/ui/search-select"
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

	// Fetch users for owner selection with search (admin/staff only)
	const [ownerSearch, setOwnerSearch] = useState("")
	const { data: usersData, isLoading: ownersLoading } = useQuery({
		queryKey: ["admin", "owners", ownerSearch],
		queryFn: () =>
			fetcher<{ users: any[] }>(
				`/api/v1/admin/users?role=CUSTOMER&search=${encodeURIComponent(ownerSearch)}&limit=50`
			),
		enabled: currentUser ? (currentUser.isAdmin || currentUser.isSuperAdmin || currentUser.isStaff) : false,
	})

	const users = usersData?.users || []
	const ownerOptions: SearchSelectOption[] = (() => {
		const fromUsers = users.map((u: any) => ({
			value: u.id,
			label: u.name || u.email || "Unknown",
			subLabel: u.phone ? `${u.email} • ${u.phone}` : u.email,
		}))
		// When editing, ensure current owner is in options even if not in search results
		if (pet?.owner && ownerId && !fromUsers.some((o) => o.value === ownerId)) {
			return [
				{
					value: pet.owner.id,
					label: pet.owner.name || pet.owner.email || "Unknown",
					subLabel: pet.owner.phone ? `${pet.owner.email} • ${pet.owner.phone}` : pet.owner.email,
				},
				...fromUsers,
			]
		}
		return fromUsers
	})()

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
						<SearchSelect
							options={ownerOptions}
							value={ownerId}
							onValueChange={setOwnerId}
							placeholder="Search by owner name, email, or phone..."
							searchPlaceholder="Search by name, email, or phone..."
							emptyText="No owner found. Try different search."
							onSearchChange={setOwnerSearch}
							loading={ownersLoading}
							renderOption={(opt) => (
								<>
									<span className="font-medium">{opt.label}</span>
									{opt.subLabel && (
										<span className="ml-2 text-muted-foreground text-xs">{opt.subLabel}</span>
									)}
								</>
							)}
						/>
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

