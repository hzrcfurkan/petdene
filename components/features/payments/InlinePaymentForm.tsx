"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Invoice } from "@/lib/react-query/hooks/invoices"
import { DollarSign, Loader2, CreditCard } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { StripePaymentForm } from "./StripePaymentForm"

interface InlinePaymentFormProps {
	invoice: Invoice
	onSuccess: () => void
}

export function InlinePaymentForm({ invoice, onSuccess }: InlinePaymentFormProps) {
	const [paymentMethod, setPaymentMethod] = useState<string>("")
	const [isStripeDialogOpen, setIsStripeDialogOpen] = useState(false)
	const [isCashDialogOpen, setIsCashDialogOpen] = useState(false)
	const [clientSecret, setClientSecret] = useState<string | null>(null)
	const [isLoadingIntent, setIsLoadingIntent] = useState(false)
	const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

	// Open dialog when payment method is selected
	useEffect(() => {
		if (paymentMethod === "stripe" && stripeKey && !isStripeDialogOpen) {
			setIsStripeDialogOpen(true)
			// Load payment intent
			if (!clientSecret && !isLoadingIntent) {
				setIsLoadingIntent(true)
				fetch("/api/v1/payments/stripe", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ invoiceId: invoice.id }),
				})
					.then((res) => res.json())
					.then((data) => {
						if (data.clientSecret) {
							setClientSecret(data.clientSecret)
						} else if (data.error) {
							toast.error(data.error)
							setIsStripeDialogOpen(false)
							setPaymentMethod("")
						}
					})
					.catch((error) => {
						toast.error("Failed to initialize payment")
						console.error(error)
						setIsStripeDialogOpen(false)
						setPaymentMethod("")
					})
					.finally(() => setIsLoadingIntent(false))
			}
		} else if (paymentMethod === "cash" && !isCashDialogOpen) {
			setIsCashDialogOpen(true)
		}
	}, [paymentMethod, stripeKey, isStripeDialogOpen, isCashDialogOpen, invoice.id, clientSecret, isLoadingIntent])

	const handleCashPayment = async () => {
		try {
			const response = await fetch("/api/v1/payments", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					invoiceId: invoice.id,
					method: "cash",
					amount: invoice.amount,
				}),
			})

			const data = await response.json()
			if (!response.ok) throw new Error(data.error || "Failed to process payment")

			toast.success("Cash payment recorded! Please bring the payment to the clinic. Staff will confirm it.")
			onSuccess()
			setIsCashDialogOpen(false)
			setPaymentMethod("")
		} catch (error: any) {
			toast.error(error.message || "Failed to process cash payment")
		}
	}

	return (
		<>
			<div className="w-full min-w-[200px]">
				<Select value={paymentMethod} onValueChange={setPaymentMethod}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Pay invoice" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="cash">
							<div className="flex items-center gap-2">
								<DollarSign className="w-4 h-4" />
								Cash Payment
							</div>
						</SelectItem>
						{stripeKey && (
							<SelectItem value="stripe">
								<div className="flex items-center gap-2">
									<CreditCard className="w-4 h-4" />
									Credit/Debit Card
								</div>
							</SelectItem>
						)}
					</SelectContent>
				</Select>
			</div>

			{/* Cash Payment Dialog */}
			{isCashDialogOpen && (
				<Dialog
					open={isCashDialogOpen}
					onOpenChange={(open) => {
						setIsCashDialogOpen(open)
						if (!open) {
							setPaymentMethod("")
						}
					}}
				>
					<DialogContent className="max-w-md">
						<DialogHeader>
							<DialogTitle className="text-xl">Record Cash Payment</DialogTitle>
							<DialogDescription>
								Invoice #{invoice.id.slice(0, 8).toUpperCase()} - ${invoice.amount.toFixed(2)}
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<Alert className="border-blue-200 bg-blue-50">
								<AlertDescription className="text-sm">
									<div className="space-y-2">
										<p className="font-medium">Cash Payment Instructions:</p>
										<ul className="list-disc list-inside space-y-1 ml-2 text-sm">
											<li>Click "Confirm Cash Payment" to record this payment</li>
											<li>Please bring the exact amount (${invoice.amount.toFixed(2)}) to the clinic</li>
											<li>Payment will be confirmed by staff when you arrive</li>
										</ul>
									</div>
								</AlertDescription>
							</Alert>
							<div className="rounded-lg border bg-muted/30 p-4">
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">Amount to Pay:</span>
									<span className="text-lg font-bold">${invoice.amount.toFixed(2)}</span>
								</div>
							</div>
							<div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setIsCashDialogOpen(false)
										setPaymentMethod("")
									}}
									className="w-full sm:w-auto"
								>
									Cancel
								</Button>
								<Button
									type="button"
									onClick={handleCashPayment}
									className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
									size="lg"
								>
									<DollarSign className="mr-2 h-4 w-4" />
									Confirm Cash Payment
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			)}

			{/* Stripe Payment Dialog */}
			{isStripeDialogOpen && (
				<Dialog
					open={isStripeDialogOpen}
					onOpenChange={(open) => {
						setIsStripeDialogOpen(open)
						if (!open) {
							setPaymentMethod("")
							setClientSecret(null)
						}
					}}
				>
					<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle className="text-xl">Complete Payment</DialogTitle>
							<DialogDescription>
								Pay for invoice #{invoice.id.slice(0, 8).toUpperCase()} - ${invoice.amount.toFixed(2)}
							</DialogDescription>
						</DialogHeader>
						{isLoadingIntent ? (
							<div className="flex flex-col items-center justify-center py-12 space-y-4">
								<Loader2 className="h-8 w-8 animate-spin text-primary" />
								<div className="text-center space-y-1">
									<p className="font-medium">Loading Payment Form</p>
									<p className="text-sm text-muted-foreground">Please wait while we prepare your secure payment...</p>
								</div>
							</div>
						) : clientSecret ? (
							<StripePaymentForm
								invoice={invoice}
								onSuccess={() => {
									onSuccess()
									setIsStripeDialogOpen(false)
									setPaymentMethod("")
									setClientSecret(null)
								}}
								onCancel={() => {
									setIsStripeDialogOpen(false)
									setPaymentMethod("")
									setClientSecret(null)
								}}
								clientSecret={clientSecret}
							/>
						) : (
							<div className="text-center py-8">
								<p className="text-muted-foreground">Failed to load payment form. Please try again.</p>
								<Button
									variant="outline"
									onClick={() => {
										setIsStripeDialogOpen(false)
										setPaymentMethod("")
										setClientSecret(null)
									}}
									className="mt-4"
								>
									Close
								</Button>
							</div>
						)}
					</DialogContent>
				</Dialog>
			)}
		</>
	)
}
