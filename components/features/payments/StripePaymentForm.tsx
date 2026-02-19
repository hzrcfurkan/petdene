"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Invoice } from "@/lib/react-query/hooks/invoices"
import { loadStripe, type Stripe, type StripeElements } from "@stripe/stripe-js"
import { CreditCard, Loader2, Shield } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

interface StripePaymentFormProps {
	invoice: Invoice
	onSuccess: () => void
	onCancel: () => void
	clientSecret: string
}

export function StripePaymentForm({ invoice, onSuccess, onCancel, clientSecret }: StripePaymentFormProps) {
	const [stripe, setStripe] = useState<Stripe | null>(null)
	const [elements, setElements] = useState<StripeElements | null>(null)
	const [isProcessing, setIsProcessing] = useState(false)
	const [isReady, setIsReady] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const formRef = useRef<HTMLFormElement>(null)
	const paymentElementRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		let mounted = true

		const initializeStripe = async () => {
			try {
				const stripeInstance = await stripePromise
				if (!stripeInstance || !mounted) return

				setStripe(stripeInstance)

				const elementsInstance = stripeInstance.elements({
					clientSecret,
					appearance: {
						theme: "stripe",
					},
				})

				if (!mounted) return
				setElements(elementsInstance)

				// Create and mount Payment Element
				const paymentElement = elementsInstance.create("payment", {
					layout: "tabs",
				})

				if (paymentElementRef.current) {
					paymentElement.mount(paymentElementRef.current)
				}

				// Wait for element to be ready
				paymentElement.on("ready", () => {
					if (mounted) {
						setIsReady(true)
					}
				})

				// Handle errors
				paymentElement.on("change", (event) => {
					if (event.error && mounted) {
						setError(event.error.message)
					} else if (mounted) {
						setError(null)
					}
				})

				return () => {
					paymentElement.unmount()
				}
			} catch (err) {
				console.error("Failed to initialize Stripe:", err)
				if (mounted) {
					toast.error("Failed to load payment form. Please refresh the page.")
				}
			}
		}

		initializeStripe()

		return () => {
			mounted = false
		}
	}, [clientSecret])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!stripe || !elements) {
			toast.error("Stripe is not loaded. Please refresh the page.")
			return
		}

		if (!invoice?.id) {
			toast.error("Invalid invoice. Please refresh the page and try again.")
			return
		}

		setIsProcessing(true)
		setError(null)

		try {
			// Submit payment
			const { error: submitError } = await elements.submit()
			if (submitError) {
				throw submitError
			}

			// Confirm payment
			const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
				elements,
				confirmParams: {
					return_url: `${window.location.origin}/customer/invoices?payment=success`,
				},
				redirect: "if_required",
			})

			if (confirmError) {
				throw confirmError
			}

			if (paymentIntent && paymentIntent.status === "succeeded") {
				// Update payment and invoice status immediately
				try {
					await fetch("/api/v1/payments/confirm", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							paymentIntentId: paymentIntent.id,
							invoiceId: invoice.id,
						}),
					})
				} catch (confirmError) {
					console.error("Failed to confirm payment status:", confirmError)
					// Continue anyway - webhook will handle it
				}

				toast.success("Payment completed successfully! Your invoice has been marked as paid.", {
					duration: 5000,
				})
				onSuccess()
			} else {
				toast.error("Payment is still processing. Please wait...")
			}
		} catch (err: any) {
			console.error("Stripe payment error:", err)
			setError(err.message || "Failed to process payment")
			toast.error(err.message || "Failed to process payment")
		} finally {
			setIsProcessing(false)
		}
	}

	return (
		<form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
			{/* Card Information */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="text-base font-semibold">Card Information</h3>
					{isReady && (
						<div className="flex items-center gap-1 text-xs text-green-600">
							<Shield className="w-3 h-3" />
							<span>Ready</span>
						</div>
					)}
				</div>
				<Card>
					<CardContent className="pt-6">
						<div ref={paymentElementRef} id="payment-element" />
					</CardContent>
				</Card>
				{error && (
					<Alert variant="destructive">
						<AlertDescription className="text-xs">{error}</AlertDescription>
					</Alert>
				)}
				<Alert>
					<Shield className="h-4 w-4" />
					<AlertDescription className="text-xs">
						Your payment information is encrypted and secure. We never store your card details.
					</AlertDescription>
				</Alert>
			</div>

			{/* Payment Summary */}
			<div className="rounded-lg border bg-muted/30 p-4">
				<div className="flex items-center justify-between text-sm">
					<span className="text-muted-foreground">Amount to Pay:</span>
					<span className="text-lg font-bold">${invoice.amount.toFixed(2)}</span>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					disabled={isProcessing}
					className="w-full sm:w-auto"
				>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={isProcessing || !isReady}
					className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
					size="lg"
				>
					{isProcessing ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Processing Payment...
						</>
					) : (
						<>
							<CreditCard className="mr-2 h-4 w-4" />
							Pay ${invoice.amount.toFixed(2)}
						</>
					)}
				</Button>
			</div>
		</form>
	)
}

