"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { useCreateAppointment } from "@/lib/react-query/hooks/appointments"
import { toast } from "sonner"
import { fetcher } from "@/lib/react-query/fetcher"
import { useQuery } from "@tanstack/react-query"
import { currentUserClient } from "@/lib/auth/client"
import { Calendar, Plus } from "lucide-react"
import { DateTimePicker } from "@/components/ui/date-time-picker"

interface CustomerAppointmentPopupProps {
	onSuccess?: () => void
	trigger?: React.ReactNode
}

export function CustomerAppointmentPopup({ onSuccess, trigger }: CustomerAppointmentPopupProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [petId, setPetId] = useState("")
	const [serviceId, setServiceId] = useState("")
	const [date, setDate] = useState("")
	const [notes, setNotes] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)

	const currentUser = currentUserClient()
	const { mutate: createAppointment } = useCreateAppointment()

	// Fetch customer's pets
	const { data: petsData, isLoading: petsLoading } = useQuery({
		queryKey: ["pets", currentUser?.id],
		queryFn: () => fetcher<{ pets: any[] }>(
			`/api/v1/pets?limit=100&ownerId=${currentUser?.id || ""}`
		),
		enabled: !!currentUser && isOpen,
	})

	// Fetch active services
	const { data: servicesData, isLoading: servicesLoading } = useQuery({
		queryKey: ["pet-services", "active"],
		queryFn: () => fetcher<{ services: any[] }>("/api/v1/pet-services?active=true&limit=100"),
		enabled: isOpen,
	})

	const pets = petsData?.pets || []
	const services = servicesData?.services || []

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		
		if (!petId || !serviceId || !date) {
			toast.error("Please fill in all required fields")
			return
		}

		setIsSubmitting(true)

		try {
			createAppointment(
				{
					petId,
					serviceId,
					date: new Date(date).toISOString(),
					notes: notes || undefined,
				},
				{
					onSuccess: () => {
						toast.success("Appointment created successfully! We'll review and confirm it soon.")
						setIsOpen(false)
						// Reset form
						setPetId("")
						setServiceId("")
						setDate("")
						setNotes("")
						if (onSuccess) {
							onSuccess()
						}
					},
					onError: (error: any) => {
						toast.error(error?.info?.error || "Failed to create appointment. Please try again.")
					},
				}
			)
		} catch (error: any) {
			toast.error(error?.info?.error || "Failed to create appointment")
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open)
		if (!open) {
			// Reset form when closing
			setPetId("")
			setServiceId("")
			setDate("")
			setNotes("")
		}
	}

	// Set minimum date to today
	const minDate = new Date().toISOString().slice(0, 16)

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				{trigger || (
					<Button>
						<Plus className="w-4 h-4 mr-2" />
						Book Appointment
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Calendar className="w-5 h-5" />
						Book New Appointment
					</DialogTitle>
					<DialogDescription>
						Schedule an appointment for your pet. Select your pet, choose a service, and pick a date and time.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						{/* Pet Selection */}
						<div className="space-y-2">
							<Label htmlFor="petId">
								Pet <span className="text-red-500">*</span>
							</Label>
							<Select
								value={petId}
								onValueChange={setPetId}
								required
								disabled={petsLoading || pets.length === 0}
							>
								<SelectTrigger id="petId">
									<SelectValue placeholder={petsLoading ? "Loading..." : pets.length === 0 ? "No pets available" : "Select your pet"} />
								</SelectTrigger>
								<SelectContent>
									{pets.map((pet) => (
										<SelectItem key={pet.id} value={pet.id}>
											{pet.name} ({pet.species})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{pets.length === 0 && (
								<p className="text-xs text-muted-foreground">
									You need to add a pet before booking an appointment.
								</p>
							)}
						</div>

						{/* Service Selection */}
						<div className="space-y-2">
							<Label htmlFor="serviceId">
								Service <span className="text-red-500">*</span>
							</Label>
							<Select
								value={serviceId}
								onValueChange={setServiceId}
								required
								disabled={servicesLoading || services.length === 0}
							>
								<SelectTrigger id="serviceId">
									<SelectValue placeholder={servicesLoading ? "Loading..." : services.length === 0 ? "No services available" : "Select a service"} />
								</SelectTrigger>
								<SelectContent>
									{services.map((service) => (
										<SelectItem key={service.id} value={service.id}>
											{service.title} - ${service.price}
											{service.duration && ` (${service.duration} min)`}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Date & Time */}
					<div className="space-y-2">
						<Label htmlFor="date">
							Date & Time <span className="text-red-500">*</span>
						</Label>
						<DateTimePicker
							id="date"
							value={date}
							onChange={setDate}
							placeholder="Select date and time"
							min={minDate}
							required
						/>
						<p className="text-xs text-muted-foreground">
							Please select a date and time in the future
						</p>
					</div>

					{/* Notes */}
					<div className="space-y-2">
						<Label htmlFor="notes">Additional Notes (Optional)</Label>
						<Textarea
							id="notes"
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Any special requests or information about your pet..."
							rows={3}
						/>
					</div>

					{/* Info Message */}
					<div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
						<p className="text-sm text-blue-900 dark:text-blue-100">
							<strong>Note:</strong> Your appointment will be submitted as <strong>PENDING</strong>. 
							Our staff will review and confirm it. You'll be notified once it's confirmed.
						</p>
					</div>

					{/* Action Buttons */}
					<div className="flex justify-end gap-2 pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting || pets.length === 0 || services.length === 0}
						>
							{isSubmitting ? "Booking..." : "Book Appointment"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}

