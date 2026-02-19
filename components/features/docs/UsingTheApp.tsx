import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, LogIn, PawPrint, Calendar, FileText, CreditCard, Users } from "lucide-react"

export function UsingTheApp() {
	return (
		<section id="using" className="scroll-mt-20 bg-muted/50 py-12 sm:py-16 md:py-20">
			<div className="mx-auto max-w-4xl">
				<div className="mb-12 text-center">
					<h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Using the Application</h2>
					<p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">
						Learn how to use all the features of the Pet Care application
					</p>
				</div>

				{/* Getting Started */}
				<Card className="mb-8">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<LogIn className="h-5 w-5" />
							</div>
							<div>
								<CardTitle>Getting Started: Sign Up or Sign In</CardTitle>
								<CardDescription>Create an account or use test credentials</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-4">
							<div className="rounded-lg border p-4">
								<h3 className="mb-2 text-sm font-semibold">Option 1: Create a New Account</h3>
								<ol className="ml-4 list-decimal space-y-2 text-sm">
									<li>Click "Sign Up" or "Get Started" on the homepage</li>
									<li>Fill in your information:
										<ul className="ml-4 mt-1 list-disc space-y-1 text-xs text-muted-foreground">
											<li>Name</li>
											<li>Email address</li>
											<li>Password (minimum 8 characters)</li>
										</ul>
									</li>
									<li>Click "Create Account"</li>
									<li>You'll be automatically logged in and redirected to your dashboard</li>
								</ol>
							</div>
							<div className="rounded-lg border p-4">
								<h3 className="mb-2 text-sm font-semibold">Option 2: Use Test Accounts</h3>
								<p className="mb-3 text-xs text-muted-foreground">
									If you seeded the database, you can use these pre-configured accounts:
								</p>
								<div className="space-y-2 text-xs">
									<div className="rounded-md bg-muted p-2">
										<strong>Super Admin:</strong> superadmin@petcare.com / password123
									</div>
									<div className="rounded-md bg-muted p-2">
										<strong>Admin:</strong> admin@petcare.com / password123
									</div>
									<div className="rounded-md bg-muted p-2">
										<strong>Staff:</strong> sarah.johnson@petcare.com / password123
									</div>
									<div className="rounded-md bg-muted p-2">
										<strong>Customer:</strong> john.doe@example.com / password123
									</div>
								</div>
								<p className="mt-3 text-xs text-muted-foreground">
									Visit the{" "}
									<a href="/demo" className="text-primary underline">
										Demo page
									</a>{" "}
									for more details about test accounts.
								</p>
							</div>
							<div className="rounded-lg border p-4">
								<h3 className="mb-2 text-sm font-semibold">Option 3: Sign In with Google (If Configured)</h3>
								<ol className="ml-4 list-decimal space-y-2 text-sm">
									<li>Click "Sign in with Google" button</li>
									<li>Select your Google account</li>
									<li>Grant permissions</li>
									<li>You'll be automatically logged in</li>
								</ol>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* User Roles */}
				<Card className="mb-8">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Users className="h-5 w-5" />
							</div>
							<div>
								<CardTitle>Understanding User Roles</CardTitle>
								<CardDescription>Different roles have different permissions</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="rounded-lg border p-4">
								<div className="mb-2 flex items-center gap-2">
									<Badge variant="destructive">Super Admin</Badge>
								</div>
								<p className="text-xs text-muted-foreground">
									Full system access including user management, all admin features, and system
									configuration.
								</p>
							</div>
							<div className="rounded-lg border p-4">
								<div className="mb-2 flex items-center gap-2">
									<Badge variant="default">Admin</Badge>
								</div>
								<p className="text-xs text-muted-foreground">
									Manage appointments, pets, services, staff operations, and view all customer data.
								</p>
							</div>
							<div className="rounded-lg border p-4">
								<div className="mb-2 flex items-center gap-2">
									<Badge variant="secondary">Staff</Badge>
								</div>
								<p className="text-xs text-muted-foreground">
									Access appointments, medical records, pet management, and can create prescriptions
									and vaccinations.
								</p>
							</div>
							<div className="rounded-lg border p-4">
								<div className="mb-2 flex items-center gap-2">
									<Badge variant="outline">Customer</Badge>
								</div>
								<p className="text-xs text-muted-foreground">
									Manage your own pets, book appointments, view medical records, and manage invoices
									for your pets.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Features Guide */}
				<Card className="mb-8">
					<CardHeader>
						<CardTitle>Feature Guide</CardTitle>
						<CardDescription>How to use each feature of the application</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Pet Management */}
						<div className="rounded-lg border p-4">
							<div className="mb-3 flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<PawPrint className="h-5 w-5" />
								</div>
								<div>
									<h3 className="font-semibold">Pet Management</h3>
									<p className="text-xs text-muted-foreground">Manage your pet profiles</p>
								</div>
							</div>
							<div className="ml-13 space-y-2 text-sm">
								<p className="font-medium">How to add a pet:</p>
								<ol className="ml-4 list-decimal space-y-1 text-xs text-muted-foreground">
									<li>Go to "Pets" in the navigation menu</li>
									<li>Click "Add New Pet" button</li>
									<li>Fill in pet information:
										<ul className="ml-4 mt-1 list-disc">
											<li>Name, species, breed</li>
											<li>Date of birth or age</li>
											<li>Gender, weight</li>
											<li>Upload a photo (optional)</li>
										</ul>
									</li>
									<li>Click "Save" to create the pet profile</li>
								</ol>
								<p className="mt-3 font-medium">What you can do:</p>
								<ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
									<li>View all your pets in a list</li>
									<li>Edit pet information</li>
									<li>View pet's medical history</li>
									<li>Delete pets (if no appointments exist)</li>
								</ul>
							</div>
						</div>

						{/* Appointments */}
						<div className="rounded-lg border p-4">
							<div className="mb-3 flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<Calendar className="h-5 w-5" />
								</div>
								<div>
									<h3 className="font-semibold">Appointment Booking</h3>
									<p className="text-xs text-muted-foreground">Schedule and manage appointments</p>
								</div>
							</div>
							<div className="ml-13 space-y-2 text-sm">
								<p className="font-medium">How to book an appointment:</p>
								<ol className="ml-4 list-decimal space-y-1 text-xs text-muted-foreground">
									<li>Go to "Appointments" in the navigation</li>
									<li>Click "Book Appointment" or "New Appointment"</li>
									<li>Select a pet from your list</li>
									<li>Choose a service (Grooming, Vet Checkup, etc.)</li>
									<li>Select date and time</li>
									<li>Add any notes or special instructions</li>
									<li>Click "Book Appointment"</li>
								</ol>
								<p className="mt-3 font-medium">Appointment statuses:</p>
								<ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
									<li>
										<strong>Scheduled:</strong> Appointment is confirmed
									</li>
									<li>
										<strong>Completed:</strong> Appointment has been finished
									</li>
									<li>
										<strong>Cancelled:</strong> Appointment was cancelled
									</li>
								</ul>
							</div>
						</div>

						{/* Medical Records */}
						<div className="rounded-lg border p-4">
							<div className="mb-3 flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<FileText className="h-5 w-5" />
								</div>
								<div>
									<h3 className="font-semibold">Medical Records</h3>
									<p className="text-xs text-muted-foreground">Track your pet's health history</p>
								</div>
							</div>
							<div className="ml-13 space-y-2 text-sm">
								<p className="font-medium">What's included:</p>
								<ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
									<li>Visit history and diagnoses</li>
									<li>Treatments and medications</li>
									<li>Vaccination records</li>
									<li>Prescription history</li>
									<li>Notes from veterinarians</li>
								</ul>
								<p className="mt-3 text-xs text-muted-foreground">
									<strong>Note:</strong> Medical records are typically created by staff/admin during
									appointments. Customers can view their pet's records but usually cannot create them.
								</p>
							</div>
						</div>

						{/* Billing */}
						<div className="rounded-lg border p-4">
							<div className="mb-3 flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<CreditCard className="h-5 w-5" />
								</div>
								<div>
									<h3 className="font-semibold">Billing & Invoices</h3>
									<p className="text-xs text-muted-foreground">Manage payments and invoices</p>
								</div>
							</div>
							<div className="ml-13 space-y-2 text-sm">
								<p className="font-medium">How invoices work:</p>
								<ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
									<li>Invoices are automatically created when appointments are completed</li>
									<li>View all invoices in the "Invoices" section</li>
									<li>Download invoices as PDF</li>
									<li>Make payments (if Stripe is configured)</li>
									<li>Track payment history</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Navigation Tips */}
				<Card className="mb-8">
					<CardHeader>
						<CardTitle>Navigation Tips</CardTitle>
						<CardDescription>How to navigate the application</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="space-y-2 text-sm">
							<p className="font-medium">Main Navigation:</p>
							<ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
								<li>Use the sidebar menu (left side) to access different sections</li>
								<li>Click on your profile picture/name to access profile settings</li>
								<li>Use the search bar (if available) to quickly find pets or appointments</li>
								<li>Click the logo to return to the dashboard</li>
							</ul>
							<p className="mt-4 font-medium">Dashboard:</p>
							<ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
								<li>View overview statistics</li>
								<li>See recent appointments and activities</li>
								<li>Quick access to common actions</li>
							</ul>
						</div>
					</CardContent>
				</Card>

				{/* Tips & Best Practices */}
				<Card className="border-primary/20 bg-primary/5">
					<CardHeader>
						<CardTitle>Tips & Best Practices</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<ul className="space-y-2 text-sm">
							<li className="flex items-start gap-2">
								<span className="text-primary">•</span>
								<span className="text-xs text-muted-foreground">
									<strong>Keep pet information updated:</strong> Regularly update your pet's weight,
									medical conditions, and contact information
								</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary">•</span>
								<span className="text-xs text-muted-foreground">
									<strong>Book appointments in advance:</strong> Popular time slots fill up quickly
								</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary">•</span>
								<span className="text-xs text-muted-foreground">
									<strong>Check vaccination reminders:</strong> The system will notify you when
									vaccinations are due
								</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary">•</span>
								<span className="text-xs text-muted-foreground">
									<strong>Download medical records:</strong> Keep copies of important medical records
									for your records
								</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary">•</span>
								<span className="text-xs text-muted-foreground">
									<strong>Use filters and search:</strong> When you have many pets or appointments, use
									the search and filter features to find what you need quickly
								</span>
							</li>
						</ul>
					</CardContent>
				</Card>
			</div>
		</section>
	)
}

