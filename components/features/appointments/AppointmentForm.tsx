"use client"

import { useCurrency } from "@/components/providers/CurrencyProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCreateAppointment, useUpdateAppointment, type Appointment } from "@/lib/react-query/hooks/appointments"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { fetcher } from "@/lib/react-query/fetcher"
import { useQuery } from "@tanstack/react-query"
import { currentUserClient } from "@/lib/auth/client"
import { DateTimePicker } from "@/components/ui/date-time-picker"

interface AppointmentFormProps {
	appointment?: Appointment | null
	onSuccess: () => void
	onCancel: () => void
}

export function AppointmentForm({ appointment, onSuccess, onCancel }: AppointmentFormProps) {
	const { formatCurrency } = useCurrency()
	const [petId, setPetId] = useState(appointment?.petId || "")
	const [serviceId, setServiceId] = useState(appointment?.serviceId || "")
	const [staffId, setStaffId] = useState(appointment?.staffId || "")
	const [date, setDate] = useState(
		appointment?.date ? new Date(appointment.date).toISOString().slice(0, 16) : ""
	)
	const [status, setStatus] = useState(appointment?.status || "PENDING")
	const [notes, setNotes] = useState(appointment?.notes || "")
	const [isSubmitting, setIsSubmitting] = useState(false)

	const currentUser = currentUserClient()
	const { mutate: createAppointment } = useCreateAppointment()
	const { mutate: updateAppointment } = useUpdateAppointment()

	// Fetch pets (filtered by owner if customer)
	const { data: petsData } = useQuery({
		queryKey: ["pets", currentUser?.role === "CUSTOMER" ? currentUser.id : undefined],
		queryFn: () => fetcher<{ pets: any[] }>(
			`/api/v1/pets?limit=100${currentUser?.role === "CUSTOMER" ? `&ownerId=${currentUser.id}` : ""}`
		),
		enabled: !!currentUser,
	})

	// Fetch services
	const { data: servicesData } = useQuery({
		queryKey: ["pet-services", "active"],
		queryFn: () => fetcher<{ services: any[] }>("/api/v1/pet-services?active=true&limit=100"),
	})

	// Fetch staff (only for admin/staff)
	const { data: staffData } = useQuery({
		queryKey: ["admin", "staff"],
		queryFn: () => fetcher<{ users: any[] }>("/api/v1/admin/users?role=STAFF&limit=100"),
		enabled: currentUser ? (currentUser.isAdmin || currentUser.isSuperAdmin || currentUser.isStaff) : false,
	})

	const pets = petsData?.pets || []
	const services = servicesData?.services || []
	const staff = staffData?.users || []

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)

		try {
			const data = {
				petId,
				serviceId,
				...(currentUser?.isStaff || currentUser?.isAdmin || currentUser?.isSuperAdmin
					? { staffId: staffId || undefined }
					: {}),
				date: new Date(date).toISOString(),
				...(currentUser?.isStaff || currentUser?.isAdmin || currentUser?.isSuperAdmin
					? { status }
					: {}),
				notes: notes || undefined,
			}

			if (appointment) {
				const updateData = {
					...data,
					...(currentUser?.isStaff || currentUser?.isAdmin || currentUser?.isSuperAdmin
						? { status }
						: {}),
				}
				await updateAppointment({ id: appointment.id, data: updateData })
				toast.success("Randevu başarıyla güncellendi")
			} else {
				await createAppointment(data)
				toast.success("Randevu başarıyla oluşturuldu")
			}
			onSuccess()
		} catch (error: any) {
			toast.error(error?.info?.error || "Randevu kaydedilemedi")
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
							<SelectValue placeholder="Hasta seçin" />
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
					<Label htmlFor="serviceId">Service *</Label>
					<Select value={serviceId} onValueChange={setServiceId} required>
						<SelectTrigger id="serviceId">
							<SelectValue placeholder="Hizmet seçin" />
						</SelectTrigger>
						<SelectContent>
							{services.map((service) => (
								<SelectItem key={service.id} value={service.id}>
									{service.title} - {formatCurrency(service.price)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{(currentUser?.isStaff || currentUser?.isAdmin || currentUser?.isSuperAdmin) && (
					<div className="space-y-2">
						<Label htmlFor="staffId">Staff Member</Label>
						<Select value={staffId || undefined} onValueChange={(value) => setStaffId(value || "")}>
							<SelectTrigger id="staffId">
								<SelectValue placeholder="Atanmamış" />
							</SelectTrigger>
							<SelectContent>
								{staff.map((member) => (
									<SelectItem key={member.id} value={member.id}>
										{member.name || member.email}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				<div className="space-y-2">
					<Label htmlFor="date">Date & Time *</Label>
					<DateTimePicker
						id="date"
						value={date}
						onChange={setDate}
						placeholder="Tarih ve saat seçin"
						required
					/>
				</div>

				{(currentUser?.isStaff || currentUser?.isAdmin || currentUser?.isSuperAdmin) && (
					<div className="space-y-2">
						<Label htmlFor="status">Status *</Label>
						<Select value={status} onValueChange={setStatus} required>
							<SelectTrigger id="status">
								<SelectValue placeholder="Durum seçin" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="PENDING">Beklemede</SelectItem>
								<SelectItem value="CONFIRMED">CONFIRMED (Approved)</SelectItem>
								<SelectItem value="COMPLETED">Tamamlandı</SelectItem>
								<SelectItem value="CANCELLED">İptal Edildi</SelectItem>
							</SelectContent>
						</Select>
						<p className="text-xs text-muted-foreground">
							{status === "Onaylandı" && "Fatura otomatik oluşturulacak"}
						</p>
					</div>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="notes">Notlar</Label>
				<Textarea
					id="notes"
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					placeholder="Additional notes about the appointment..."
					rows={3}
				/>
			</div>

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Kaydediliyor..." : appointment ? "Güncelle" : "Oluştur"} Appointment
				</Button>
			</div>
		</form>
	)
}

