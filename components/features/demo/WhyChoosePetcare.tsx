import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Clock, Users, Heart, Zap, Lock } from "lucide-react"

const BENEFITS = [
	{
		icon: Shield,
		title: "Secure & Private",
		description: "Your pet's information is encrypted and stored securely. We take privacy seriously and comply with data protection regulations.",
	},
	{
		icon: Clock,
		title: "Save Time",
		description: "Manage everything in one place. No more scattered notes, forgotten appointments, or lost medical records.",
	},
	{
		icon: Users,
		title: "Multi-Pet Support",
		description: "Manage multiple pets from a single account. Perfect for families with multiple furry friends or pet care professionals.",
	},
	{
		icon: Heart,
		title: "Comprehensive Care",
		description: "From appointments to medical records, we cover every aspect of pet care management in one integrated platform.",
	},
	{
		icon: Zap,
		title: "Fast & Reliable",
		description: "Built with modern technology for speed and reliability. Access your pet's information anytime, anywhere.",
	},
	{
		icon: Lock,
		title: "Role-Based Access",
		description: "Different access levels for customers, staff, and administrators ensure the right people see the right information.",
	},
]

export function WhyChoosePetcare() {
	return (
		<section className="py-12 sm:py-20 md:py-32">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Why Choose Pet Care</h2>
					<p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">
						Everything you need for comprehensive pet care management in one powerful platform
					</p>
				</div>
				<div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-4 sm:mt-16 sm:gap-6 md:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 xl:grid-cols-3">
					{BENEFITS.map((benefit) => {
						const Icon = benefit.icon
						return (
							<Card key={benefit.title}>
								<CardHeader>
									<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
										<Icon className="h-6 w-6" />
									</div>
									<CardTitle>{benefit.title}</CardTitle>
									<CardDescription>{benefit.description}</CardDescription>
								</CardHeader>
							</Card>
						)
					})}
				</div>
			</div>
		</section>
	)
}

