import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Play, Database, Globe, AlertCircle } from "lucide-react"

export function RunningTheApp() {
	return (
		<section id="running" className="scroll-mt-20 py-12 sm:py-16 md:py-20">
			<div className="mx-auto max-w-4xl">
				<div className="mb-12 text-center">
					<h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Running the Application</h2>
					<p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">
						Start your application and access it in your web browser
					</p>
				</div>

				{/* Database Migration */}
				<Card className="mb-8">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Database className="h-5 w-5" />
							</div>
							<div>
								<CardTitle>Step 1: Set Up Database Tables</CardTitle>
								<CardDescription>Create the database structure</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-sm text-muted-foreground">
							Before running the app, you need to create the database tables. This is called "running
							migrations."
						</p>
						<div className="space-y-4">
							<div className="rounded-lg border p-4">
								<h3 className="mb-2 text-sm font-semibold">Generate Prisma Client</h3>
								<p className="mb-3 text-xs text-muted-foreground">
									This creates the database connection code:
								</p>
								<code className="block rounded-md bg-muted p-3 text-xs">npx prisma generate</code>
								<p className="mt-2 text-xs text-muted-foreground">
									You should see: "✔ Generated Prisma Client"
								</p>
							</div>
							<div className="rounded-lg border p-4">
								<h3 className="mb-2 text-sm font-semibold">Run Database Migrations</h3>
								<p className="mb-3 text-xs text-muted-foreground">
									This creates all the tables in your database:
								</p>
								<code className="block rounded-md bg-muted p-3 text-xs">npx prisma migrate dev</code>
								<p className="mt-2 text-xs text-muted-foreground">
									You'll be asked to name the migration - just press Enter to use the default name.
								</p>
								<div className="mt-3 rounded-md bg-green-500/10 p-3">
									<div className="flex items-start gap-2">
										<CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
										<p className="text-xs text-green-800 dark:text-green-200">
											Success: You should see messages like "Applied migration" and "The following
											models have been created"
										</p>
									</div>
								</div>
							</div>
							<div className="rounded-lg border p-4">
								<h3 className="mb-2 text-sm font-semibold">Seed the Database (Optional but Recommended)</h3>
								<p className="mb-3 text-xs text-muted-foreground">
									Add sample data including test users, pets, and appointments:
								</p>
								<code className="block rounded-md bg-muted p-3 text-xs">npm run db:seed</code>
								<p className="mt-2 text-xs text-muted-foreground">
									This creates test accounts you can use to log in. Check the console output for login
									credentials.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Start Development Server */}
				<Card className="mb-8">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Play className="h-5 w-5" />
							</div>
							<div>
								<CardTitle>Step 2: Start the Development Server</CardTitle>
								<CardDescription>Run the application locally</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-sm text-muted-foreground">
							Start the development server to run your application on your computer.
						</p>
						<div className="rounded-lg border p-4">
							<code className="block rounded-md bg-muted p-3 text-xs">npm run dev</code>
							<p className="mt-3 text-xs text-muted-foreground">
								This command starts the development server. You'll see output like:
							</p>
							<div className="mt-2 rounded-md bg-background p-3">
								<code className="block text-xs">
									{`▲ Next.js 16.0.1
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000`}
								</code>
							</div>
						</div>
						<div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
							<div className="flex items-start gap-2">
								<CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
								<div>
									<p className="text-sm font-medium text-green-900 dark:text-green-100">
										Server Started Successfully!
									</p>
									<p className="mt-1 text-xs text-green-800 dark:text-green-200">
										Keep this terminal window open while using the app. Closing it will stop the server.
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Access the App */}
				<Card className="mb-8">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Globe className="h-5 w-5" />
							</div>
							<div>
								<CardTitle>Step 3: Open in Browser</CardTitle>
								<CardDescription>Access your application</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-4">
							<div className="rounded-lg border p-4">
								<h3 className="mb-2 text-sm font-semibold">Open the Application</h3>
								<ol className="ml-4 list-decimal space-y-2 text-sm">
									<li>Open your web browser (Chrome, Firefox, Safari, Edge)</li>
									<li>
										Navigate to:{" "}
										<code className="rounded bg-muted px-1 py-0.5 text-xs">http://localhost:3000</code>
									</li>
									<li>You should see the Pet Care landing page</li>
								</ol>
							</div>
							<div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
								<div className="flex items-start gap-2">
									<Globe className="h-5 w-5 shrink-0 text-blue-600" />
									<div>
										<p className="text-sm font-medium text-blue-900 dark:text-blue-100">
											What is localhost:3000?
										</p>
										<p className="mt-1 text-xs text-blue-800 dark:text-blue-200">
											"localhost" means "this computer" and 3000 is the port number. This URL only works
											on your computer - others can't access it unless you deploy it.
										</p>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Common Commands */}
				<Card className="mb-8">
					<CardHeader>
						<CardTitle>Common Commands Reference</CardTitle>
						<CardDescription>Useful commands for development</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="rounded-lg border p-4">
								<div className="mb-2 flex items-center gap-2">
									<Badge variant="default">Development</Badge>
								</div>
								<code className="block text-xs">npm run dev</code>
								<p className="mt-2 text-xs text-muted-foreground">
									Start development server with hot reload (auto-refresh on code changes)
								</p>
							</div>
							<div className="rounded-lg border p-4">
								<div className="mb-2 flex items-center gap-2">
									<Badge variant="default">Production</Badge>
								</div>
								<code className="block text-xs">npm run build</code>
								<p className="mt-2 text-xs text-muted-foreground">Build the app for production</p>
							</div>
							<div className="rounded-lg border p-4">
								<div className="mb-2 flex items-center gap-2">
									<Badge variant="secondary">Database</Badge>
								</div>
								<code className="block text-xs">npx prisma migrate dev</code>
								<p className="mt-2 text-xs text-muted-foreground">Create and apply database migrations</p>
							</div>
							<div className="rounded-lg border p-4">
								<div className="mb-2 flex items-center gap-2">
									<Badge variant="secondary">Database</Badge>
								</div>
								<code className="block text-xs">npm run db:seed</code>
								<p className="mt-2 text-xs text-muted-foreground">Add sample data to database</p>
							</div>
							<div className="rounded-lg border p-4">
								<div className="mb-2 flex items-center gap-2">
									<Badge variant="outline">Database</Badge>
								</div>
								<code className="block text-xs">npx prisma studio</code>
								<p className="mt-2 text-xs text-muted-foreground">
									Open database viewer in browser (useful for debugging)
								</p>
							</div>
							<div className="rounded-lg border p-4">
								<div className="mb-2 flex items-center gap-2">
									<Badge variant="outline">Code Quality</Badge>
								</div>
								<code className="block text-xs">npm run lint</code>
								<p className="mt-2 text-xs text-muted-foreground">Check code for errors and style issues</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Troubleshooting */}
				<Card className="border-yellow-500/20 bg-yellow-500/5">
					<CardHeader>
						<div className="flex items-center gap-3">
							<AlertCircle className="h-5 w-5 text-yellow-600" />
							<div>
								<CardTitle>Having Issues?</CardTitle>
								<CardDescription>Common problems and solutions</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-3">
						<div>
							<p className="mb-2 text-sm font-semibold">Port 3000 already in use:</p>
							<p className="text-xs text-muted-foreground">
								Another application is using port 3000. Either close that application or change the port:
							</p>
							<code className="mt-1 block rounded-md bg-muted p-2 text-xs">PORT=3001 npm run dev</code>
						</div>
						<div>
							<p className="mb-2 text-sm font-semibold">Database connection error:</p>
							<p className="text-xs text-muted-foreground">
								Check your DATABASE_URL in .env.local. Make sure your database is running and the
								credentials are correct.
							</p>
						</div>
						<div>
							<p className="mb-2 text-sm font-semibold">Module not found errors:</p>
							<p className="text-xs text-muted-foreground">
								Run <code className="rounded bg-muted px-1 py-0.5 text-xs">npm install</code> again to
								install missing packages.
							</p>
						</div>
						<p className="mt-4 text-sm text-muted-foreground">
							For more help, see the{" "}
							<a href="#troubleshooting" className="font-medium text-primary underline">
								Troubleshooting section
							</a>
							.
						</p>
					</CardContent>
				</Card>
			</div>
		</section>
	)
}

