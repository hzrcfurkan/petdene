import LayoutLanding from "@/components/layout/landing"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
	Heart,
	Calendar,
	Stethoscope,
	Syringe,
	FileText,
	CreditCard,
	Shield,
	Sparkles,
	CheckCircle2,
	ArrowRight,
	Users,
	Clock,
	Star,
	PawPrint,
} from "lucide-react"

export default function Home() {
	return (
		<LayoutLanding>
			{/* Hero Section */}
			<section className="relative overflow-hidden py-20 sm:py-32">
				<div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-3xl text-center">
						<div className="mb-8 flex justify-center">
							<Badge variant="secondary" className="gap-2 px-4 py-1.5">
								<Sparkles className="h-4 w-4" />
								All-in-One Pet Care Solution
							</Badge>
						</div>
						<h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
							Complete Care for Your
							<span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
								{" "}
								Furry Friends
							</span>
						</h1>
						<p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
							Manage appointments, track vaccinations, maintain medical records, and keep your pets healthy
							all in one place. Professional pet care management made simple.
						</p>
						<div className="mt-10 flex items-center justify-center gap-4">
							<Button asChild size="lg" className="gap-2">
								<Link href="/signup">
									Get Started
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg">
								<Link href="/signin">Sign In</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-12 sm:py-16">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
						<div className="text-center">
							<div className="text-3xl font-bold text-primary sm:text-4xl">1000+</div>
							<div className="mt-2 text-sm text-muted-foreground">Happy Pets</div>
						</div>
						<div className="text-center">
							<div className="text-3xl font-bold text-primary sm:text-4xl">500+</div>
							<div className="mt-2 text-sm text-muted-foreground">Pet Owners</div>
						</div>
						<div className="text-center">
							<div className="text-3xl font-bold text-primary sm:text-4xl">24/7</div>
							<div className="mt-2 text-sm text-muted-foreground">Support</div>
						</div>
						<div className="text-center">
							<div className="text-3xl font-bold text-primary sm:text-4xl">5★</div>
							<div className="mt-2 text-sm text-muted-foreground">Rated Service</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section id="features" className="py-20 sm:py-32">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-2xl text-center">
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything You Need</h2>
						<p className="mt-4 text-lg text-muted-foreground">
							Comprehensive features to manage every aspect of your pet's health and care
						</p>
					</div>
					<div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
						<Card className="group hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<PawPrint className="h-6 w-6" />
								</div>
								<CardTitle>Pet Management</CardTitle>
								<CardDescription>
									Keep detailed profiles of all your pets with photos, medical history, and important
									information
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2 text-sm text-muted-foreground">
									<li className="flex items-center gap-2">
										<CheckCircle2 className="h-4 w-4 text-primary" />
										Pet profiles & photos
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle2 className="h-4 w-4 text-primary" />
										Medical history tracking
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle2 className="h-4 w-4 text-primary" />
										Breed & species information
									</li>
								</ul>
							</CardContent>
						</Card>

						<Card className="group hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<Calendar className="h-6 w-6" />
								</div>
								<CardTitle>Appointment Booking</CardTitle>
								<CardDescription>
									Schedule and manage appointments with ease. Never miss a vet visit or grooming
									session
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2 text-sm text-muted-foreground">
									<li className="flex items-center gap-2">
										<CheckCircle2 className="h-4 w-4 text-primary" />
										Easy online booking
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle2 className="h-4 w-4 text-primary" />
										Appointment reminders
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle2 className="h-4 w-4 text-primary" />
										Status tracking
									</li>
								</ul>
							</CardContent>
						</Card>

						<Card className="group hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<Stethoscope className="h-6 w-6" />
								</div>
								<CardTitle>Medical Records</CardTitle>
								<CardDescription>
									Maintain comprehensive medical records with diagnoses, treatments, and visit history
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2 text-sm text-muted-foreground">
									<li className="flex items-center gap-2">
										<CheckCircle2 className="h-4 w-4 text-primary" />
										Complete medical history
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle2 className="h-4 w-4 text-primary" />
										Diagnosis tracking
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle2 className="h-4 w-4 text-primary" />
										Treatment records
									</li>
								</ul>
							</CardContent>
						</Card>

						<Card className="group hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<Syringe className="h-6 w-6" />
								</div>
								<CardTitle>Vaccination Tracking</CardTitle>
								<CardDescription>
									Never miss a vaccination. Track all vaccines with due dates and reminders
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2 text-sm text-muted-foreground">
									<li className="flex items-center gap-2">
										<CheckCircle2 className="h-4 w-4 text-primary" />
										Vaccine history
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle2 className="h-4 w-4 text-primary" />
										Due date reminders
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle2 className="h-4 w-4 text-primary" />
										Automatic notifications
									</li>
								</ul>
							</CardContent>
						</Card>

						<Card className="group hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<FileText className="h-6 w-6" />
								</div>
								<CardTitle>Prescriptions</CardTitle>
								<CardDescription>
									Manage prescriptions and medications with dosage instructions and refill reminders
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2 text-sm text-muted-foreground">
									<li className="flex items-center gap-2">
										<CheckCircle2 className="h-4 w-4 text-primary" />
										Prescription history
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle2 className="h-4 w-4 text-primary" />
										Medication tracking
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle2 className="h-4 w-4 text-primary" />
										Refill reminders
									</li>
								</ul>
							</CardContent>
						</Card>

						<Card className="group hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<CreditCard className="h-6 w-6" />
								</div>
								<CardTitle>Billing & Invoices</CardTitle>
								<CardDescription>
									Streamlined billing system with invoices, payments, and transaction history
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2 text-sm text-muted-foreground">
									<li className="flex items-center gap-2">
										<CheckCircle2 className="h-4 w-4 text-primary" />
										Digital invoices
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle2 className="h-4 w-4 text-primary" />
										Payment tracking
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle2 className="h-4 w-4 text-primary" />
										Transaction history
									</li>
								</ul>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Services Section */}
			<section id="services" className="bg-muted/50 py-20 sm:py-32">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-2xl text-center">
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Services</h2>
						<p className="mt-4 text-lg text-muted-foreground">
							Comprehensive pet care services to keep your furry friends healthy and happy
						</p>
					</div>
					<div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-5">
						<Card className="text-center hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
									<Sparkles className="h-8 w-8 text-primary" />
								</div>
								<CardTitle className="text-lg">Grooming</CardTitle>
								<CardDescription>Professional grooming services for all breeds</CardDescription>
							</CardHeader>
						</Card>

						<Card className="text-center hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
									<Stethoscope className="h-8 w-8 text-primary" />
								</div>
								<CardTitle className="text-lg">Vet Checkup</CardTitle>
								<CardDescription>Regular health checkups and consultations</CardDescription>
							</CardHeader>
						</Card>

						<Card className="text-center hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
									<Heart className="h-8 w-8 text-primary" />
								</div>
								<CardTitle className="text-lg">Bath</CardTitle>
								<CardDescription>Professional bathing and hygiene services</CardDescription>
							</CardHeader>
						</Card>

						<Card className="text-center hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
									<Shield className="h-8 w-8 text-primary" />
								</div>
								<CardTitle className="text-lg">Boarding</CardTitle>
								<CardDescription>Safe and comfortable boarding facilities</CardDescription>
							</CardHeader>
						</Card>

						<Card className="text-center hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
									<Star className="h-8 w-8 text-primary" />
								</div>
								<CardTitle className="text-lg">Training</CardTitle>
								<CardDescription>Professional training and behavior services</CardDescription>
							</CardHeader>
						</Card>
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className="py-20 sm:py-32">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-2xl text-center">
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
						<p className="mt-4 text-lg text-muted-foreground">
							Get started in three simple steps
						</p>
					</div>
					<div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
						<div className="flex flex-col items-center text-center">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
								1
							</div>
							<h3 className="mt-6 text-xl font-semibold">Create Your Account</h3>
							<p className="mt-2 text-muted-foreground">
								Sign up in seconds and start managing your pet's care immediately
							</p>
						</div>
						<div className="flex flex-col items-center text-center">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
								2
							</div>
							<h3 className="mt-6 text-xl font-semibold">Add Your Pets</h3>
							<p className="mt-2 text-muted-foreground">
								Create profiles for all your pets with photos and important information
							</p>
						</div>
						<div className="flex flex-col items-center text-center">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
								3
							</div>
							<h3 className="mt-6 text-xl font-semibold">Book Services</h3>
							<p className="mt-2 text-muted-foreground">
								Schedule appointments, track vaccinations, and manage everything in one place
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Benefits Section */}
			<section className="bg-muted/50 py-20 sm:py-32">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-2xl text-center">
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why Choose Us</h2>
						<p className="mt-4 text-lg text-muted-foreground">
							Everything you need for comprehensive pet care management
						</p>
					</div>
					<div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
						<div className="flex gap-4">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Shield className="h-5 w-5" />
							</div>
							<div>
								<h3 className="text-lg font-semibold">Secure & Private</h3>
								<p className="mt-2 text-muted-foreground">
									Your pet's information is encrypted and stored securely. We take privacy seriously.
								</p>
							</div>
						</div>
						<div className="flex gap-4">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Clock className="h-5 w-5" />
							</div>
							<div>
								<h3 className="text-lg font-semibold">Save Time</h3>
								<p className="mt-2 text-muted-foreground">
									Manage everything in one place. No more scattered notes or forgotten appointments.
								</p>
							</div>
						</div>
						<div className="flex gap-4">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Users className="h-5 w-5" />
							</div>
							<div>
								<h3 className="text-lg font-semibold">Multi-Pet Support</h3>
								<p className="mt-2 text-muted-foreground">
									Manage multiple pets from a single account. Perfect for families with multiple furry
									friends.
								</p>
							</div>
						</div>
						<div className="flex gap-4">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Heart className="h-5 w-5" />
							</div>
							<div>
								<h3 className="text-lg font-semibold">Comprehensive Care</h3>
								<p className="mt-2 text-muted-foreground">
									From appointments to medical records, we cover every aspect of pet care management.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 sm:py-32">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="relative isolate overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 rounded-3xl px-6 py-16 sm:px-16 sm:py-24 lg:px-24">
						<div className="mx-auto max-w-2xl text-center">
							<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
								Ready to Get Started?
							</h2>
							<p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
								Join hundreds of pet owners who trust us to manage their pet's health and care. Start
								your journey today.
							</p>
							<div className="mt-10 flex items-center justify-center gap-4">
								<Button asChild size="lg" className="gap-2">
									<Link href="/signup">
										Create Free Account
										<ArrowRight className="h-4 w-4" />
									</Link>
								</Button>
								<Button asChild variant="outline" size="lg">
									<Link href="/signin">Sign In</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>
		</LayoutLanding>
	)
}
