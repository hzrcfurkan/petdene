"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateInvoice, useUpdateInvoice, type Invoice } from "@/lib/react-query/hooks/invoices"
import { useVisits } from "@/lib/react-query/hooks/visits"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { useCurrency } from "@/components/providers/CurrencyProvider"

interface InvoiceFormProps {
	invoice?: Invoice | null
	onSuccess: () => void
	onCancel: () => void
}

export function InvoiceForm({ invoice, onSuccess, onCancel }: InvoiceFormProps) {
	const { formatCurrency } = useCurrency()
	const [visitId, setVisitId] = useState(invoice?.visitId || "")
	const [amount, setAmount] = useState(invoice?.amount.toString() || "")
	const [status, setStatus] = useState<"Ödenmedi" | "Ödendi" | "İptal Edildi">(invoice?.status || "Ödenmedi")
	const [isSubmitting, setIsSubmitting] = useState(false)

	const createInvoiceMutation = useCreateInvoice()
	const updateInvoiceMutation = useUpdateInvoice()

	// Fetch visits without invoices (protocols available for invoicing)
	const { data: visitsData, isLoading: isLoadingVisits } = useVisits({
		limit: 500,
		sort: "protocol-desc",
		forInvoice: true,
	})

	const visits = visitsData?.visits || []

	// Auto-populate amount when visit (protocol) is selected
	useEffect(() => {
		if (!invoice && visitId && visits.length > 0) {
			const selectedVisit = visits.find((v) => v.id === visitId)
			if (selectedVisit?.totalAmount != null && selectedVisit.totalAmount > 0 && !amount) {
				setAmount(selectedVisit.totalAmount.toString())
			}
		}
	}, [visitId, visits, invoice, amount])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)

		try {
			if (invoice) {
				await updateInvoiceMutation.mutateAsync({
					id: invoice.id,
					data: {
						amount: parseFloat(amount),
						status,
					},
				})
				toast.success("Fatura başarıyla güncellendi")
			} else {
				await createInvoiceMutation.mutateAsync({
					visitId,
					amount: parseFloat(amount),
					status,
				})
				toast.success("Fatura başarıyla oluşturuldu")
			}
			onSuccess()
		} catch (error: any) {
			toast.error(error?.info?.error || "Failed to save invoice")
		} finally {
			setIsSubmitting(false)
		}
	}

	// Edit mode: invoice already exists
	if (invoice) {
		return (
			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="space-y-2">
					<Label className="text-sm font-medium">Source</Label>
					<p className="text-sm text-muted-foreground py-2">
						{invoice.visit
							? `Protocol PRO-${invoice.visit.protocolNumber} • ${invoice.visit.pet?.name}`
							: invoice.appointment
								? `${invoice.appointment.pet?.name} - ${invoice.appointment.service?.title}`
								: "—"}
					</p>
				</div>
				<div className="space-y-2">
					<Label htmlFor="amount" className="text-sm font-medium">Amount *</Label>
					<Input
						id="amount"
						type="number"
						step="0.01"
						min="0"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						required
						placeholder="0.00"
						className="w-full h-11"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="status" className="text-sm font-medium">Status *</Label>
					<Select value={status} onValueChange={(value: "Ödenmedi" | "Ödendi" | "İptal Edildi") => setStatus(value)} required>
						<SelectTrigger id="status" className="w-full h-11">
							<SelectValue placeholder="Select status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="Ödenmedi">Unpaid</SelectItem>
							<SelectItem value="Ödendi">Ödenen</SelectItem>
							<SelectItem value="İptal Edildi">İptal Edildi</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="flex justify-end gap-3 pt-2">
					<Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
						Cancel
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Kaydediliyor..." : "Güncelle"} Invoice
					</Button>
				</div>
			</form>
		)
	}

	// Create mode: select protocol (visit)
	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Protocol selection - full width */}
			<div className="space-y-2">
				<Label htmlFor="visitId" className="text-sm font-medium">
					Protocol (Visit) *
				</Label>
				{isLoadingVisits ? (
					<Select disabled>
						<SelectTrigger id="visitId" className="w-full h-11">
							<SelectValue placeholder="Loading protocols..." />
						</SelectTrigger>
					</Select>
				) : visits.length === 0 ? (
					<div className="space-y-2">
						<Select disabled>
							<SelectTrigger id="visitId" className="w-full h-11">
								<SelectValue placeholder="No protocols available" />
							</SelectTrigger>
						</Select>
						<p className="text-sm text-muted-foreground">
							No visits (protocols) available for invoicing. Create a visit first, add services, and ensure it doesn&apos;t already have an invoice.
						</p>
					</div>
				) : (
					<Select value={visitId} onValueChange={setVisitId} required>
						<SelectTrigger id="visitId" className="w-full h-11">
							<SelectValue placeholder="Select a protocol" />
						</SelectTrigger>
						<SelectContent>
							{visits.map((visit) => (
								<SelectItem key={visit.id} value={visit.id}>
									PRO-{visit.protocolNumber} • {visit.pet?.name} • {format(new Date(visit.visitDate), "MMM dd, yyyy")} • {formatCurrency(visit.totalAmount)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}
			</div>

			{/* Amount & Status - full width stacked */}
			<div className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="amount" className="text-sm font-medium">
						Amount *
					</Label>
					<Input
						id="amount"
						type="number"
						step="0.01"
						min="0"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						required
						placeholder="0.00"
						className="w-full h-11"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="status" className="text-sm font-medium">
						Status *
					</Label>
					<Select value={status} onValueChange={(value: "Ödenmedi" | "Ödendi" | "İptal Edildi") => setStatus(value)} required>
						<SelectTrigger id="status" className="w-full h-11">
							<SelectValue placeholder="Select status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="Ödenmedi">Unpaid</SelectItem>
							<SelectItem value="Ödendi">Ödenen</SelectItem>
							<SelectItem value="İptal Edildi">İptal Edildi</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Actions */}
			<div className="flex justify-end gap-3 pt-2">
				<Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting || !visitId || visits.length === 0}>
					{isSubmitting ? "Creating..." : "Oluştur"} Invoice
				</Button>
			</div>
		</form>
	)
}
