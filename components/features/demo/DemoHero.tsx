import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowRight, Sparkles, PawPrint } from "lucide-react"

export function DemoHero() {
	return (
		<section className="relative overflow-hidden py-12 sm:py-20 md:py-32">
			<div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-3xl text-center">
					<div className="mb-8 flex justify-center">
						<Badge variant="secondary" className="gap-2 px-4 py-1.5">
							<Sparkles className="h-4 w-4" />
							Demo & Testing Portal
						</Badge>
					</div>
					<h1 className="text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
						Explore Pet Care
						<span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
							{" "}
							Platform
						</span>
					</h1>
					<p className="mt-4 text-base leading-7 text-muted-foreground sm:mt-6 sm:text-lg sm:leading-8 md:text-xl">
						Test all features with pre-configured accounts. Experience the complete pet care management
						system with different user roles and permissions.
					</p>
					<div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
						<Button asChild size="lg" className="w-full gap-2 sm:w-auto">
							<Link href="/signin">
								Start Testing
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
						<Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
							<Link href="#test-login">View Test Accounts</Link>
						</Button>
					</div>
					<div className="mt-8 flex flex-col items-center justify-center gap-4 sm:mt-12 sm:flex-row sm:gap-6 md:gap-8">
						<div className="flex items-center gap-2 text-muted-foreground">
							<PawPrint className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
							<span className="text-xs sm:text-sm">Full Feature Access</span>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground">
							<PawPrint className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
							<span className="text-xs sm:text-sm">Multiple User Roles</span>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground">
							<PawPrint className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
							<span className="text-xs sm:text-sm">Sample Data Included</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

