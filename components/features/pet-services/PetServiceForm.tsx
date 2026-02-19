"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useCreatePetService, useUpdatePetService, type PetService } from "@/lib/react-query/hooks/pet-services"
import { toast } from "sonner"
import { useState } from "react"
import ImageUpload from "@/components/features/profile/ImageUpload"

interface PetServiceFormProps {
	service?: PetService | null
	onSuccess: () => void
	onCancel: () => void
}

const serviceTypes = ["grooming", "vet-checkup", "bath", "boarding", "training"]

export function PetServiceForm({ service, onSuccess, onCancel }: PetServiceFormProps) {
	const [title, setTitle] = useState(service?.title || "")
	const [type, setType] = useState(service?.type || "")
	const [description, setDescription] = useState(service?.description || "")
	const [duration, setDuration] = useState(service?.duration?.toString() || "")
	const [price, setPrice] = useState(service?.price?.toString() || "")
	const [image, setImage] = useState(service?.image || "")
	const [active, setActive] = useState(service?.active !== undefined ? service.active : true)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const { mutate: createService } = useCreatePetService()
	const { mutate: updateService } = useUpdatePetService()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)

		try {
			const data: any = {
				title,
				type,
				description: description || undefined,
				duration: duration ? Number.parseInt(duration) : undefined,
				price: Number.parseFloat(price),
				image: image || undefined,
				active,
			}

			if (service) {
				await updateService({ id: service.id, data })
				toast.success("Service updated successfully")
			} else {
				await createService(data)
				toast.success("Service created successfully")
			}
			onSuccess()
		} catch (error: any) {
			toast.error(error?.info?.error || "Failed to save service")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="title">Title *</Label>
					<Input
						id="title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						required
						placeholder="Service title"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="type">Type *</Label>
					<Select value={type} onValueChange={setType} required>
						<SelectTrigger id="type">
							<SelectValue placeholder="Select service type" />
						</SelectTrigger>
						<SelectContent>
							{serviceTypes.map((t) => (
								<SelectItem key={t} value={t}>
									{t.charAt(0).toUpperCase() + t.slice(1).replace("-", " ")}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="price">Price ($) *</Label>
					<Input
						id="price"
						type="number"
						step="0.01"
						min="0"
						value={price}
						onChange={(e) => setPrice(e.target.value)}
						required
						placeholder="0.00"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="duration">Duration (minutes)</Label>
					<Input
						id="duration"
						type="number"
						min="0"
						value={duration}
						onChange={(e) => setDuration(e.target.value)}
						placeholder="e.g., 60"
					/>
				</div>

				<div className="space-y-2">
					<Label>Service Image</Label>
					<ImageUpload
						value={image}
						onChange={setImage}
						showReuse={true}
						imgHeight={200}
						imgWidth="100%"
					/>
				</div>

				<div className="space-y-2 flex items-center gap-4">
					<Label htmlFor="active" className="flex items-center gap-2 cursor-pointer">
						<Switch
							id="active"
							checked={active}
							onCheckedChange={setActive}
						/>
						<span>Active</span>
					</Label>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Service description..."
					rows={3}
				/>
			</div>

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Saving..." : service ? "Update" : "Create"} Service
				</Button>
			</div>
		</form>
	)
}

