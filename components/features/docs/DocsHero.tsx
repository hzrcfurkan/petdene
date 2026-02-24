import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BookOpen, ArrowDown, CheckCircle2 } from "lucide-react"

export function DocsHero() {
	return (
		<section className="relative overflow-hidden py-12 sm:py-20 md:py-32">
			<div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-3xl text-center">
					<div className="mb-8 flex justify-center">
						<Badge variant="secondary" className="gap-2 px-4 py-1.5">
							<BookOpen className="h-4 w-4" />
							Complete Installation Guide
						</Badge>
					</div>
					<h1 className="text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
						Pet Care
						<span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
							{" "}
							Documentation
						</span>
					</h1>
					<p className="mt-4 text-base leading-7 text-muted-foreground sm:mt-6 sm:text-lg sm:leading-8 md:text-xl">
						Step-by-step guide for beginners and non-coders. Learn how to install, configure, and use the
						Pet Care application from scratch.
					</p>
					<div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
						<Button asChild size="lg" className="w-full gap-2 sm:w-auto">
							<a href="#installation">
								Get Started
								<ArrowDown className="h-4 w-4" />
							</a>
						</Button>
						<Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
							<a href="#using">View Usage Guide</a>
						</Button>
					</div>
					<div className="mt-8 flex flex-col items-center justify-center gap-4 sm:mt-12 sm:flex-row sm:gap-6 md:gap-8">
						<div className="flex items-center gap-2 text-muted-foreground">
							<CheckCircle2 className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
							<span className="text-xs sm:text-sm">Beginner Friendly</span>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground">
							<CheckCircle2 className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
							<span className="text-xs sm:text-sm">Step-by-Step Instructions</span>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground">
							<CheckCircle2 className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
							<span className="text-xs sm:text-sm">Troubleshooting Included</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

