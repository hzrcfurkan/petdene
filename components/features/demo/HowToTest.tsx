import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowRight, CheckCircle2, LogIn, UserPlus, Database, Settings } from "lucide-react"

const TESTING_STEPS = [
	{
		step: 1,
		title: "Choose a Test Account",
		description: "Select one of the pre-configured test accounts based on the role you want to test",
		icon: LogIn,
		details: [
			"Super Admin: Full system access",
			"Admin: Management features",
			"Staff: Appointment and medical records",
			"Customer: Pet management and booking",
		],
	},
	{
		step: 2,
		title: "Sign In",
		description: "Navigate to the sign-in page and use the test credentials provided above",
		icon: UserPlus,
		details: [
			"Go to /signin page",
			"Enter email and password",
			"Or use quick login feature",
			"Access your dashboard",
		],
	},
	{
		step: 3,
		title: "Explore Features",
		description: "Test all available features based on your role permissions",
		icon: Database,
		details: [
			"View sample pets and appointments",
			"Create new records",
			"Test booking system",
			"Explore medical records",
		],
	},
	{
		step: 4,
		title: "Test Different Roles",
		description: "Sign out and try different user roles to see how permissions work",
		icon: Settings,
		details: [
			"Compare role-based access",
			"Test permission restrictions",
			"See different dashboards",
			"Understand user hierarchy",
		],
	},
]

export function HowToTest() {
	return (
		<section className="py-12 sm:py-20 md:py-32">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">How to Test</h2>
					<p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">
						Follow these steps to explore all features of the Pet Care platform
					</p>
				</div>
				<div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-6 sm:mt-16 sm:gap-8 md:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
					{TESTING_STEPS.map((item) => {
						const Icon = item.icon
						return (
							<Card key={item.step}>
								<CardHeader>
									<div className="mb-4 flex items-center justify-between">
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold sm:h-12 sm:w-12 sm:text-xl">
											{item.step}
										</div>
										<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-10 sm:w-10">
											<Icon className="h-4 w-4 sm:h-5 sm:w-5" />
										</div>
									</div>
									<CardTitle className="text-base sm:text-lg">{item.title}</CardTitle>
									<CardDescription className="text-sm">{item.description}</CardDescription>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2 text-xs text-muted-foreground sm:text-sm">
										{item.details.map((detail, idx) => (
											<li key={idx} className="flex items-start gap-2">
												<CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary sm:h-4 sm:w-4" />
												<span>{detail}</span>
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						)
					})}
				</div>
				<div className="mt-12 rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6 sm:mt-16 sm:p-8">
					<div className="mx-auto max-w-2xl text-center">
						<h3 className="text-xl font-bold sm:text-2xl">Ready to Start Testing?</h3>
						<p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base">
							Use the test accounts above to explore all features. All accounts come pre-loaded with
							sample data including pets, appointments, and medical records.
						</p>
						<div className="mt-6 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row sm:gap-4">
							<Button asChild size="lg" className="w-full gap-2 sm:w-auto">
								<Link href="/signin">
									Go to Sign In
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
								<Link href="#test-login">View Test Accounts</Link>
							</Button>
						</div>
						<div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8 sm:gap-4">
							<Badge variant="secondary" className="gap-1.5 text-xs sm:gap-2 sm:text-sm">
								<CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
								Sample Data Included
							</Badge>
							<Badge variant="secondary" className="gap-1.5 text-xs sm:gap-2 sm:text-sm">
								<CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
								Multiple Roles Available
							</Badge>
							<Badge variant="secondary" className="gap-1.5 text-xs sm:gap-2 sm:text-sm">
								<CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
								Full Feature Access
							</Badge>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

