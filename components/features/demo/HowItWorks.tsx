import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CheckCircle2, CreditCard, FileText, PawPrint, UserPlus } from "lucide-react"

const STEPS = [
	{
		number: 1,
		title: "Sign Up or Use Test Account",
		description: "Create a new account or use one of our pre-configured test accounts to get started immediately",
		icon: UserPlus,
		features: ["Quick registration", "Test accounts available", "Multiple role options"],
	},
	{
		number: 2,
		title: "Add Your Pets",
		description: "Create detailed profiles for your pets with photos, breed information, and medical history",
		icon: PawPrint,
		features: ["Pet profiles", "Photo uploads", "Medical history"],
	},
	{
		number: 3,
		title: "Book Appointments",
		description: "Schedule appointments for grooming, vet checkups, or other services with our easy booking system",
		icon: Calendar,
		features: ["Online booking", "Service selection", "Time slot booking"],
	},
	{
		number: 4,
		title: "Manage Medical Records",
		description: "Keep track of vaccinations, prescriptions, and medical records all in one centralized location",
		icon: FileText,
		features: ["Vaccination tracking", "Prescription management", "Medical history"],
	},
	{
		number: 5,
		title: "Handle Billing",
		description: "View invoices, make payments, and track all financial transactions related to your pet care",
		icon: CreditCard,
		features: ["Digital invoices", "Payment tracking", "Transaction history"],
	},
]

export function HowItWorks() {
	return (
		<section className="bg-muted/50 py-12 sm:py-20 md:py-32">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">How It Works</h2>
					<p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">
						Get started with Pet Care in five simple steps
					</p>
				</div>
				<div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-6 sm:mt-16 sm:grid-cols-2 sm:gap-8 md:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 xl:grid-cols-3">
					{STEPS.map((step) => {
						const Icon = step.icon
						return (
							<Card key={step.number}>
								<CardHeader>
									<div className="mb-4 flex items-center justify-between">
										<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
											{step.number}
										</div>
										<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
											<Icon className="h-5 w-5" />
										</div>
									</div>
									<CardTitle className="text-lg">{step.title}</CardTitle>
									<CardDescription>{step.description}</CardDescription>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2 text-sm text-muted-foreground">
										{step.features.map((feature, idx) => (
											<li key={idx} className="flex items-center gap-2">
												<CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
												{feature}
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						)
					})}
				</div>
			</div>
		</section>
	)
}

