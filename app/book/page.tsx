"use client"

import LayoutLanding from "@/components/layout/landing"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, CheckCircle2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { useCurrency } from "@/components/providers/CurrencyProvider"

export default function BookPage() {
	const { formatCurrency } = useCurrency()
	const router = useRouter()
	const [services, setServices] = useState<{ id: string; title: string; price: number; duration?: number }[]>([])
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [success, setSuccess] = useState(false)
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		petName: "",
		species: "Köpek",
		serviceId: "",
		date: "",
		notes: "",
	})

	useEffect(() => {
		fetch("/api/v1/bookings/guest/services")
			.then((r) => r.json())
			.then((data) => setServices(data.services || []))
			.catch(() => toast.error("Failed to load services"))
	}, [])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)
		try {
			const res = await fetch("/api/v1/bookings/guest", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: formData.name,
					email: formData.email,
					phone: formData.phone || undefined,
					petName: formData.petName,
					species: formData.species,
					serviceId: formData.serviceId,
					date: formData.date,
					notes: formData.notes || undefined,
				}),
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.error || "Booking failed")
			setSuccess(true)
			toast.success("Appointment booked successfully!")
		} catch (err: any) {
			toast.error(err.message || "Failed to book appointment")
		} finally {
			setIsSubmitting(false)
		}
	}

	if (success) {
		return (
			<LayoutLanding>
				<div className="min-h-[60vh] flex items-center justify-center px-4">
					<Card className="max-w-md w-full">
						<CardHeader>
							<div className="flex justify-center mb-4">
								<div className="rounded-full bg-green-100 p-4">
									<CheckCircle2 className="h-12 w-12 text-green-600" />
								</div>
							</div>
							<CardTitle className="text-center">Booking Confirmed!</CardTitle>
							<CardDescription className="text-center">
								Your appointment has been booked successfully. An account was created for you.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-sm text-muted-foreground text-center">
								Please sign in to view and manage your appointments. Check your email for account details.
							</p>
							<div className="flex gap-2">
								<Button asChild className="flex-1">
									<Link href="/signin">Sign In</Link>
								</Button>
								<Button asChild variant="outline" className="flex-1">
									<Link href="/">Back to Home</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</LayoutLanding>
		)
	}

	return (
		<LayoutLanding>
			<div className="py-16 px-4">
				<div className="max-w-2xl mx-auto">
					<div className="text-center mb-12">
						<h1 className="text-3xl font-bold tracking-tight">Book an Appointment</h1>
						<p className="mt-2 text-muted-foreground">
							No account? No problem. Enter your details below and we&apos;ll create one for you.
						</p>
					</div>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calendar className="h-5 w-5" />
								Guest Booking
							</CardTitle>
							<CardDescription>
								Fill in your information and pet details. We&apos;ll create your account and book the appointment.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-6">
								<div className="grid gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="name">Your Name *</Label>
										<Input
											id="name"
											value={formData.name}
											onChange={(e) => setFormData({ ...formData, name: e.target.value })}
											placeholder="Ad Soyad"
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="email">Email *</Label>
										<Input
											id="email"
											type="email"
											value={formData.email}
											onChange={(e) => setFormData({ ...formData, email: e.target.value })}
											placeholder="ornek@eposta.com"
											required
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="phone">Telefon</Label>
									<Input
										id="phone"
										value={formData.phone}
										onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
										placeholder="+90 555 123 4567"
									/>
								</div>
								<div className="border-t pt-6">
									<h3 className="font-medium mb-4">Pet Information</h3>
									<div className="grid gap-4 sm:grid-cols-2">
										<div className="space-y-2">
											<Label htmlFor="petName">Pet Name *</Label>
											<Input
												id="petName"
												value={formData.petName}
												onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
												placeholder="Max"
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="species">Species *</Label>
											<Select
												value={formData.species}
												onValueChange={(v) => setFormData({ ...formData, species: v })}
											>
												<SelectTrigger id="species">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="Köpek">Dog</SelectItem>
													<SelectItem value="Kedi">Cat</SelectItem>
													<SelectItem value="Kuş">Bird</SelectItem>
													<SelectItem value="Diğer">Other</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="serviceId">Service *</Label>
									<Select
										value={formData.serviceId}
										onValueChange={(v) => setFormData({ ...formData, serviceId: v })}
										required
									>
										<SelectTrigger id="serviceId">
											<SelectValue placeholder="Hizmet seçin" />
										</SelectTrigger>
										<SelectContent>
											{services.map((s) => (
												<SelectItem key={s.id} value={s.id}>
													{s.title} - {formatCurrency(s.price)}
													{s.duration ? ` (${s.duration} min)` : ""}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="date">Preferred Date & Time *</Label>
									<Input
										id="date"
										type="datetime-local"
										value={formData.date}
										onChange={(e) => setFormData({ ...formData, date: e.target.value })}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="notes">Notlar</Label>
									<Textarea
										id="notes"
										value={formData.notes}
										onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
										placeholder="Any special requests..."
										rows={3}
									/>
								</div>
								<Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
									{isSubmitting ? "Booking..." : "Randevu Al"}
								</Button>
								<p className="text-center text-sm text-muted-foreground">
									Already have an account?{" "}
									<Link href="/signin" className="text-primary hover:underline">
										Sign in
									</Link>{" "}
									to manage your appointments.
								</p>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</LayoutLanding>
	)
}
