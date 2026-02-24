import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Download, Database, Code, Terminal } from "lucide-react"

export function InstallationGuide() {
	return (
		<section id="installation" className="scroll-mt-20 py-12 sm:py-16 md:py-20">
			<div className="mx-auto max-w-4xl">
				<div className="mb-12 text-center">
					<h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Installation Guide</h2>
					<p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">
						Follow these step-by-step instructions to install and set up the Pet Care application on your
						computer
					</p>
				</div>

				{/* Prerequisites */}
				<Card className="mb-8">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Download className="h-5 w-5" />
							</div>
							<div>
								<CardTitle>Step 1: Install Prerequisites</CardTitle>
								<CardDescription>Install the required software before starting</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						<div>
							<h3 className="mb-3 text-lg font-semibold">Required Software</h3>
							<div className="space-y-4">
								<div className="rounded-lg border p-4">
									<div className="mb-2 flex items-center gap-2">
										<Badge variant="default">Required</Badge>
										<span className="font-semibold">Node.js (Version 18 or higher)</span>
									</div>
									<p className="mb-3 text-sm text-muted-foreground">
										Node.js is a JavaScript runtime that allows you to run the application.
									</p>
									<div className="space-y-2">
										<p className="text-sm font-medium">How to install:</p>
										<ol className="ml-4 list-decimal space-y-2 text-sm">
											<li>
												Visit{" "}
												<a
													href="https://nodejs.org"
													target="_blank"
													rel="noopener noreferrer"
													className="text-primary underline"
												>
													https://nodejs.org
												</a>
											</li>
											<li>Download the LTS (Long Term Support) version</li>
											<li>Run the installer and follow the installation wizard</li>
											<li>Restart your computer after installation</li>
										</ol>
										<div className="mt-3 rounded-md bg-muted p-3">
											<p className="text-xs font-medium">Verify Installation:</p>
											<code className="mt-1 block text-xs">
												Open Terminal (Mac/Linux) or Command Prompt (Windows) and type:
												<br />
												<span className="text-primary">node --version</span>
											</code>
											<p className="mt-2 text-xs text-muted-foreground">
												You should see a version number like v18.17.0 or higher
											</p>
										</div>
									</div>
								</div>

								<div className="rounded-lg border p-4">
									<div className="mb-2 flex items-center gap-2">
										<Badge variant="default">Required</Badge>
										<span className="font-semibold">npm (Comes with Node.js)</span>
									</div>
									<p className="mb-3 text-sm text-muted-foreground">
										npm is a package manager that helps install project dependencies.
									</p>
									<div className="mt-3 rounded-md bg-muted p-3">
										<p className="text-xs font-medium">Verify Installation:</p>
										<code className="mt-1 block text-xs">
											Type in Terminal/Command Prompt:
											<br />
											<span className="text-primary">npm --version</span>
										</code>
									</div>
								</div>

								<div className="rounded-lg border p-4">
									<div className="mb-2 flex items-center gap-2">
										<Badge variant="secondary">Required</Badge>
										<span className="font-semibold">PostgreSQL Database</span>
									</div>
									<p className="mb-3 text-sm text-muted-foreground">
										A database to store all your application data (pets, users, appointments, etc.).
									</p>
									<div className="space-y-2">
										<p className="text-sm font-medium">Option 1: Install Locally</p>
										<ol className="ml-4 list-decimal space-y-2 text-sm">
											<li>
												Visit{" "}
												<a
													href="https://www.postgresql.org/download"
													target="_blank"
													rel="noopener noreferrer"
													className="text-primary underline"
												>
													https://www.postgresql.org/download
												</a>
											</li>
											<li>Download PostgreSQL for your operating system</li>
											<li>Install with default settings (remember the password you set!)</li>
										</ol>
										<p className="mt-3 text-sm font-medium">Option 2: Use Cloud Database (Recommended for Beginners)</p>
										<ul className="ml-4 list-disc space-y-2 text-sm">
											<li>
												<a
													href="https://supabase.com"
													target="_blank"
													rel="noopener noreferrer"
													className="text-primary underline"
												>
													Supabase
												</a>{" "}
												(Free tier available)
											</li>
											<li>
												<a
													href="https://neon.tech"
													target="_blank"
													rel="noopener noreferrer"
													className="text-primary underline"
												>
													Neon
												</a>{" "}
												(Free tier available)
											</li>
											<li>
												<a
													href="https://railway.app"
													target="_blank"
													rel="noopener noreferrer"
													className="text-primary underline"
												>
													Railway
												</a>{" "}
												(Free tier available)
											</li>
										</ul>
									</div>
								</div>

								<div className="rounded-lg border p-4">
									<div className="mb-2 flex items-center gap-2">
										<Badge variant="outline">Optional</Badge>
										<span className="font-semibold">Git (Version Control)</span>
									</div>
									<p className="mb-3 text-sm text-muted-foreground">
										Git helps you download and manage the project code.
									</p>
									<ol className="ml-4 list-decimal space-y-2 text-sm">
										<li>
											Visit{" "}
											<a
												href="https://git-scm.com/downloads"
												target="_blank"
												rel="noopener noreferrer"
												className="text-primary underline"
											>
												https://git-scm.com/downloads
											</a>
										</li>
										<li>Download and install Git</li>
										<li>Use default settings during installation</li>
									</ol>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Download Project */}
				<Card className="mb-8">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Code className="h-5 w-5" />
							</div>
							<div>
								<CardTitle>Step 2: Download the Project</CardTitle>
								<CardDescription>Get the project files on your computer</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<h3 className="mb-3 text-lg font-semibold">Option 1: Using Git (Recommended)</h3>
							<div className="rounded-lg border bg-muted/50 p-4">
								<p className="mb-2 text-sm font-medium">Open Terminal/Command Prompt and run:</p>
								<code className="block rounded-md bg-background p-3 text-xs">
									git clone https://github.com/your-username/pet-care.git
									<br />
									cd pet-care
								</code>
							</div>
						</div>
						<div>
							<h3 className="mb-3 text-lg font-semibold">Option 2: Download as ZIP</h3>
							<ol className="ml-4 list-decimal space-y-2 text-sm">
								<li>Click the "Code" button on GitHub</li>
								<li>Select "Download ZIP"</li>
								<li>Extract the ZIP file to a folder on your computer</li>
								<li>Open Terminal/Command Prompt and navigate to the extracted folder</li>
							</ol>
							<div className="mt-3 rounded-lg border bg-muted/50 p-4">
								<p className="mb-2 text-sm font-medium">Navigate to the folder:</p>
								<code className="block rounded-md bg-background p-3 text-xs">
									cd path/to/pet-care
								</code>
								<p className="mt-2 text-xs text-muted-foreground">
									Replace "path/to/pet-care" with the actual path to your project folder
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Install Dependencies */}
				<Card className="mb-8">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Terminal className="h-5 w-5" />
							</div>
							<div>
								<CardTitle>Step 3: Install Dependencies</CardTitle>
								<CardDescription>Install all required packages and libraries</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-sm text-muted-foreground">
							Dependencies are external libraries and packages that the application needs to run. This
							process may take 2-5 minutes.
						</p>
						<div className="rounded-lg border bg-muted/50 p-4">
							<p className="mb-2 text-sm font-medium">Run this command in Terminal/Command Prompt:</p>
							<code className="block rounded-md bg-background p-3 text-xs">npm install</code>
							<p className="mt-3 text-xs text-muted-foreground">
								This will download and install all required packages. You'll see many lines of text
								scrolling - this is normal! Wait until you see a message like "added 500 packages" or
								similar.
							</p>
						</div>
						<div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
							<div className="flex items-start gap-2">
								<CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
								<div>
									<p className="text-sm font-medium text-green-900 dark:text-green-100">
										Success Indicators:
									</p>
									<ul className="mt-2 space-y-1 text-xs text-green-800 dark:text-green-200">
										<li>• No error messages in red</li>
										<li>• Message showing packages installed</li>
										<li>• A "node_modules" folder created in your project</li>
									</ul>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Database Setup */}
				<Card className="mb-8">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Database className="h-5 w-5" />
							</div>
							<div>
								<CardTitle>Step 4: Set Up Database</CardTitle>
								<CardDescription>Prepare your database for the application</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						<div>
							<h3 className="mb-3 text-lg font-semibold">Create Database</h3>
							<div className="space-y-4">
								<div className="rounded-lg border p-4">
									<p className="mb-2 text-sm font-medium">If using local PostgreSQL:</p>
									<ol className="ml-4 list-decimal space-y-2 text-sm">
										<li>Open pgAdmin (comes with PostgreSQL) or use command line</li>
										<li>Create a new database called "petcare" (or any name you prefer)</li>
										<li>Note down your database connection details:
											<ul className="ml-4 mt-2 list-disc space-y-1">
												<li>Host: usually "localhost" or "127.0.0.1"</li>
												<li>Port: usually "5432"</li>
												<li>Database name: "petcare"</li>
												<li>Username: usually "postgres"</li>
												<li>Password: the password you set during installation</li>
											</ul>
										</li>
									</ol>
								</div>
								<div className="rounded-lg border p-4">
									<p className="mb-2 text-sm font-medium">If using cloud database (Supabase/Neon/Railway):</p>
									<ol className="ml-4 list-decimal space-y-2 text-sm">
										<li>Sign up for a free account</li>
										<li>Create a new project/database</li>
										<li>Copy the connection string (DATABASE_URL) from your dashboard</li>
										<li>You'll use this in the next step (Configuration)</li>
									</ol>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Next Steps */}
				<Card className="border-primary/20 bg-primary/5">
					<CardHeader>
						<CardTitle>What's Next?</CardTitle>
						<CardDescription>Continue to the Configuration Guide</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							After completing the installation steps above, proceed to the{" "}
							<a href="#configuration" className="font-medium text-primary underline">
								Configuration Guide
							</a>{" "}
							to set up your environment variables and connect your database.
						</p>
					</CardContent>
				</Card>
			</div>
		</section>
	)
}

