import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CheckCircle2, CreditCard, FileText, PawPrint, Stethoscope, Syringe, Users } from "lucide-react"

const FEATURES = [
	{
		icon: PawPrint,
		title: "Pet Management",
		description: "Comprehensive pet profiles with photos, breed information, and detailed medical history",
		features: ["Pet profiles & photos", "Medical history tracking", "Breed & species information", "Multi-pet support"],
	},
	{
		icon: Calendar,
		title: "Appointment Booking",
		description: "Easy online booking system for scheduling vet visits, grooming, and other services",
		features: ["Online booking", "Appointment reminders", "Status tracking", "Service selection"],
	},
	{
		icon: Stethoscope,
		title: "Medical Records",
		description: "Maintain comprehensive medical records with diagnoses, treatments, and visit history",
		features: ["Complete medical history", "Diagnosis tracking", "Treatment records", "Visit history"],
	},
	{
		icon: Syringe,
		title: "Vaccination Tracking",
		description: "Never miss a vaccination with automatic tracking, due date reminders, and notifications",
		features: ["Vaccine history", "Due date reminders", "Automatic notifications", "Vaccination schedules"],
	},
	{
		icon: FileText,
		title: "Prescriptions",
		description: "Manage prescriptions and medications with dosage instructions and refill reminders",
		features: ["Prescription history", "Medication tracking", "Refill reminders", "Dosage instructions"],
	},
	{
		icon: CreditCard,
		title: "Billing & Invoices",
		description: "Streamlined billing system with digital invoices, payments, and transaction history",
		features: ["Digital invoices", "Payment tracking", "Transaction history", "Payment reminders"],
	},
	{
		icon: Users,
		title: "User Management",
		description: "Role-based access control for customers, staff, administrators, and super admins",
		features: ["Role-based access", "User management", "Permission control", "Multi-role support"],
	},
]

export function KeyFeatures() {
	return (
		<section className="bg-muted/50 py-12 sm:py-20 md:py-32">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Key Features</h2>
					<p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">
						Comprehensive features to manage every aspect of your pet's health and care
					</p>
				</div>
				<div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-6 sm:mt-16 sm:gap-8 md:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
					{FEATURES.map((feature) => {
						const Icon = feature.icon
						return (
							<Card key={feature.title}>
								<CardHeader>
									<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
										<Icon className="h-6 w-6" />
									</div>
									<CardTitle>{feature.title}</CardTitle>
									<CardDescription>{feature.description}</CardDescription>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2 text-sm text-muted-foreground">
										{feature.features.map((item, idx) => (
											<li key={idx} className="flex items-center gap-2">
												<CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
												{item}
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

