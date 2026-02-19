"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateInvoice, useUpdateInvoice, type Invoice } from "@/lib/react-query/hooks/invoices"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { fetcher } from "@/lib/react-query/fetcher"
import { useQuery } from "@tanstack/react-query"
import { currentUserClient } from "@/lib/auth/client"

interface InvoiceFormProps {
	invoice?: Invoice | null
	onSuccess: () => void
	onCancel: () => void
}

export function InvoiceForm({ invoice, onSuccess, onCancel }: InvoiceFormProps) {
	const [appointmentId, setAppointmentId] = useState(invoice?.appointmentId || "")
	const [amount, setAmount] = useState(invoice?.amount.toString() || "")
	const [status, setStatus] = useState<"UNPAID" | "PAID" | "CANCELLED">(invoice?.status || "UNPAID")
	const [isSubmitting, setIsSubmitting] = useState(false)

	const currentUser = currentUserClient()
	const { mutate: createInvoice } = useCreateInvoice()
	const { mutate: updateInvoice } = useUpdateInvoice()

	// Fetch appointments without invoices (for creating new invoices)
	// Allow CONFIRMED and COMPLETED appointments to be invoiced
	const { data: appointmentsData, isLoading: isLoadingAppointments } = useQuery({
		queryKey: ["appointments", "without-invoices"],
		queryFn: async () => {
			// Fetch both CONFIRMED and COMPLETED appointments
			const [confirmedData, completedData] = await Promise.all([
				fetcher<{ appointments: any[] }>("/api/v1/appointments?limit=1000&status=CONFIRMED"),
				fetcher<{ appointments: any[] }>("/api/v1/appointments?limit=1000&status=COMPLETED"),
			])
			// Combine and filter out appointments that already have invoices
			const allAppointments = [
				...(confirmedData?.appointments || []),
				...(completedData?.appointments || []),
			]
			return {
				appointments: allAppointments.filter((appointment) => !appointment.invoice),
			}
		},
		enabled: !invoice && !!currentUser,
	})

	// Get appointments that don't have invoices
	const appointments = appointmentsData?.appointments || []

	// Auto-populate amount when appointment is selected
	useEffect(() => {
		if (!invoice && appointmentId && appointments.length > 0) {
			const selectedAppointment = appointments.find((apt) => apt.id === appointmentId)
			if (selectedAppointment?.service?.price && !amount) {
				setAmount(selectedAppointment.service.price.toString())
			}
		}
	}, [appointmentId, appointments, invoice, amount])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)

		try {
			const data = {
				appointmentId,
				amount: parseFloat(amount),
				status,
			}

			if (invoice) {
				await updateInvoice({ id: invoice.id, data })
				toast.success("Invoice updated successfully")
			} else {
				await createInvoice(data)
				toast.success("Invoice created successfully")
			}
			onSuccess()
		} catch (error: any) {
			toast.error(error?.info?.error || "Failed to save invoice")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid gap-4 md:grid-cols-2">
				{!invoice && (
					<div className="space-y-2">
						<Label htmlFor="appointmentId">Appointment *</Label>
						{isLoadingAppointments ? (
							<Select disabled>
								<SelectTrigger id="appointmentId">
									<SelectValue placeholder="Loading appointments..." />
								</SelectTrigger>
							</Select>
						) : appointments.length === 0 ? (
							<div className="space-y-2">
								<Select disabled>
									<SelectTrigger id="appointmentId">
										<SelectValue placeholder="No appointments available" />
									</SelectTrigger>
								</Select>
								<p className="text-sm text-muted-foreground">
									No appointments available for invoicing. Appointments must be CONFIRMED or COMPLETED and not already have an invoice.
								</p>
							</div>
						) : (
							<Select value={appointmentId} onValueChange={setAppointmentId} required>
								<SelectTrigger id="appointmentId">
									<SelectValue placeholder="Select an appointment" />
								</SelectTrigger>
								<SelectContent>
									{appointments.map((appointment) => (
										<SelectItem key={appointment.id} value={appointment.id}>
											{appointment.pet?.name} - {appointment.service?.title} ({new Date(appointment.date).toLocaleDateString()}) - {appointment.status}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>
				)}

				<div className="space-y-2">
					<Label htmlFor="amount">Amount ($) *</Label>
					<Input
						id="amount"
						type="number"
						step="0.01"
						min="0"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						required
						placeholder="0.00"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="status">Status *</Label>
					<Select value={status} onValueChange={(value: "UNPAID" | "PAID" | "CANCELLED") => setStatus(value)} required>
						<SelectTrigger id="status">
							<SelectValue placeholder="Select status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="UNPAID">Unpaid</SelectItem>
							<SelectItem value="PAID">Paid</SelectItem>
							<SelectItem value="CANCELLED">Cancelled</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{invoice && (
				<div className="text-sm text-muted-foreground">
					<p>Appointment: {invoice.appointment?.pet?.name} - {invoice.appointment?.service?.title}</p>
				</div>
			)}

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Saving..." : invoice ? "Update" : "Create"} Invoice
				</Button>
			</div>
		</form>
	)
}

