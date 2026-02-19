import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Rocket, Globe, Code, BookOpen, CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"

export function NextStepsGuide() {
	return (
		<section id="next-steps" className="scroll-mt-20 py-12 sm:py-16 md:py-20">
			<div className="mx-auto max-w-4xl">
				<div className="mb-12 text-center">
					<h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">What's Next?</h2>
					<p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">
						Congratulations! Your app is running. Here's what you can do next.
					</p>
				</div>

				{/* Explore the App */}
				<Card className="mb-6">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Rocket className="h-5 w-5" />
							</div>
							<div>
								<CardTitle>1. Explore the Application</CardTitle>
								<CardDescription>Get familiar with all the features</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-sm text-muted-foreground">
							Now that your app is running, take some time to explore all the features:
						</p>
						<div className="space-y-3">
							<div className="rounded-lg border p-4">
								<h3 className="mb-2 text-sm font-semibold">Test Different User Roles</h3>
								<p className="mb-2 text-xs text-muted-foreground">
									Use the test accounts to see how different roles work:
								</p>
								<ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
									<li>Sign in as a Customer to manage pets and book appointments</li>
									<li>Sign in as Staff to manage appointments and medical records</li>
									<li>Sign in as Admin to manage the entire system</li>
									<li>Sign in as Super Admin to access all features</li>
								</ul>
								<div className="mt-3">
									<Link href="/demo" className="text-xs text-primary underline">
										View test account credentials →
									</Link>
								</div>
							</div>
							<div className="rounded-lg border p-4">
								<h3 className="mb-2 text-sm font-semibold">Try All Features</h3>
								<ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
									<li>Create pet profiles with photos</li>
									<li>Book appointments for different services</li>
									<li>Add medical records and vaccinations</li>
									<li>Create prescriptions</li>
									<li>Generate invoices and process payments</li>
									<li>Manage users and permissions</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Customize the App */}
				<Card className="mb-6">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Code className="h-5 w-5" />
							</div>
							<div>
								<CardTitle>2. Customize the Application</CardTitle>
								<CardDescription>Make it your own</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div className="rounded-lg border p-4">
								<h3 className="mb-2 text-sm font-semibold">Change Branding</h3>
								<ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
									<li>Update the logo in <code className="rounded bg-muted px-1">public/</code> folder</li>
									<li>Modify colors and theme in <code className="rounded bg-muted px-1">app/globals.css</code></li>
									<li>Update site name and metadata in <code className="rounded bg-muted px-1">app/layout.tsx</code></li>
								</ul>
							</div>
							<div className="rounded-lg border p-4">
								<h3 className="mb-2 text-sm font-semibold">Add Your Services</h3>
								<ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
									<li>Sign in as Admin</li>
									<li>Go to Pet Services section</li>
									<li>Add your own services (Grooming, Boarding, Training, etc.)</li>
									<li>Set prices and durations</li>
								</ul>
							</div>
							<div className="rounded-lg border p-4">
								<h3 className="mb-2 text-sm font-semibold">Configure Optional Features</h3>
								<ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
									<li>Set up Google OAuth for social login</li>
									<li>Configure Cloudinary for image uploads</li>
									<li>Set up Stripe for payment processing</li>
									<li>Configure Resend for email notifications</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Deploy the App */}
				<Card className="mb-6">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Globe className="h-5 w-5" />
							</div>
							<div>
								<CardTitle>3. Deploy to Production</CardTitle>
								<CardDescription>Make your app accessible online</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-sm text-muted-foreground">
							When you're ready to share your app with others, deploy it to a hosting platform:
						</p>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="rounded-lg border p-4">
								<div className="mb-2 flex items-center gap-2">
									<Badge variant="default">Recommended</Badge>
									<span className="text-sm font-semibold">Vercel</span>
								</div>
								<p className="mb-2 text-xs text-muted-foreground">
									Easiest deployment option. Free tier available. Perfect for Next.js apps.
								</p>
								<ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
									<li>Connect your GitHub repository</li>
									<li>Add environment variables</li>
									<li>Deploy automatically on every push</li>
								</ul>
							</div>
							<div className="rounded-lg border p-4">
								<div className="mb-2 flex items-center gap-2">
									<Badge variant="secondary">Alternative</Badge>
									<span className="text-sm font-semibold">Other Platforms</span>
								</div>
								<ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
									<li>Netlify - Similar to Vercel</li>
									<li>Railway - Full-stack hosting</li>
									<li>Render - Simple deployment</li>
									<li>DigitalOcean - More control</li>
								</ul>
							</div>
						</div>
						<div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
							<p className="text-xs text-yellow-800 dark:text-yellow-200">
								<strong>Important:</strong> Before deploying, make sure to set all environment variables
								in your hosting platform's dashboard. Never commit .env.local to Git!
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Learn More */}
				<Card className="mb-6">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<BookOpen className="h-5 w-5" />
							</div>
							<div>
								<CardTitle>4. Learn and Improve</CardTitle>
								<CardDescription>Continue learning and enhancing your app</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div className="rounded-lg border p-4">
								<h3 className="mb-2 text-sm font-semibold">Learn the Technologies</h3>
								<ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
									<li>
										<a href="https://nextjs.org/docs" target="_blank" rel="noopener noreferrer" className="text-primary underline">
											Next.js Documentation
										</a>{" "}
										- Learn about the framework
									</li>
									<li>
										<a href="https://www.prisma.io/docs" target="_blank" rel="noopener noreferrer" className="text-primary underline">
											Prisma Documentation
										</a>{" "}
										- Database management
									</li>
									<li>
										<a href="https://react.dev" target="_blank" rel="noopener noreferrer" className="text-primary underline">
											React Documentation
										</a>{" "}
										- UI framework
									</li>
									<li>
										<a href="https://tailwindcss.com/docs" target="_blank" rel="noopener noreferrer" className="text-primary underline">
											Tailwind CSS Documentation
										</a>{" "}
										- Styling
									</li>
								</ul>
							</div>
							<div className="rounded-lg border p-4">
								<h3 className="mb-2 text-sm font-semibold">Explore the Codebase</h3>
								<ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
									<li>Read through the code to understand how features work</li>
									<li>Check the project structure documentation</li>
									<li>Experiment with modifying components</li>
									<li>Add new features or customize existing ones</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Checklist */}
				<Card className="border-primary/20 bg-primary/5">
					<CardHeader>
						<CardTitle>Quick Checklist</CardTitle>
						<CardDescription>Things to do after setup</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2 text-sm">
							<div className="flex items-center gap-2">
								<CheckCircle2 className="h-4 w-4 text-primary" />
								<span>App is running successfully on localhost:3000</span>
							</div>
							<div className="flex items-center gap-2">
								<CheckCircle2 className="h-4 w-4 text-primary" />
								<span>Tested login with different user roles</span>
							</div>
							<div className="flex items-center gap-2">
								<CheckCircle2 className="h-4 w-4 text-primary" />
								<span>Explored main features (pets, appointments, etc.)</span>
							</div>
							<div className="flex items-center gap-2">
								<CheckCircle2 className="h-4 w-4 text-muted-foreground" />
								<span className="text-muted-foreground">Customized branding and colors</span>
							</div>
							<div className="flex items-center gap-2">
								<CheckCircle2 className="h-4 w-4 text-muted-foreground" />
								<span className="text-muted-foreground">Set up optional services (OAuth, payments, etc.)</span>
							</div>
							<div className="flex items-center gap-2">
								<CheckCircle2 className="h-4 w-4 text-muted-foreground" />
								<span className="text-muted-foreground">Prepared for deployment</span>
							</div>
						</div>
						<div className="mt-6 flex items-center gap-2">
							<Link href="/demo" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
								View Demo Page
								<ArrowRight className="h-4 w-4" />
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</section>
	)
}

