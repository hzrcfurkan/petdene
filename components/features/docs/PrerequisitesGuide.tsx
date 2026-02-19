import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, CheckCircle2, ExternalLink, AlertCircle } from "lucide-react"

export function PrerequisitesGuide() {
	return (
		<section id="prerequisites" className="scroll-mt-20 py-12 sm:py-16 md:py-20">
			<div className="mx-auto max-w-4xl">
				<div className="mb-12 text-center">
					<h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Prerequisites</h2>
					<p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">
						Install these required software tools before starting the installation process
					</p>
				</div>

				{/* Important Note */}
				<div className="mb-8 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
					<div className="flex items-start gap-2">
						<AlertCircle className="h-5 w-5 shrink-0 text-blue-600" />
						<div>
							<p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
								Before You Begin
							</p>
							<p className="mt-1 text-xs text-blue-800 dark:text-blue-200">
								Make sure you have administrator access to your computer. Some installations require
								administrator privileges. You'll also need an internet connection to download software and
								packages.
							</p>
						</div>
					</div>
				</div>

				{/* Node.js */}
				<Card className="mb-6">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Download className="h-5 w-5" />
							</div>
							<div className="flex-1">
								<div className="flex items-center gap-2">
									<CardTitle>Node.js (Version 18 or Higher)</CardTitle>
									<Badge variant="destructive">Required</Badge>
								</div>
								<CardDescription>JavaScript runtime environment needed to run the application</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-sm text-muted-foreground">
							Node.js is like an engine that runs JavaScript code on your computer. The Pet Care app is
							built with JavaScript and needs Node.js to run.
						</p>
						<div className="space-y-4">
							<div className="rounded-lg border p-4">
								<h3 className="mb-3 text-sm font-semibold">Installation Steps:</h3>
								<ol className="ml-4 list-decimal space-y-2 text-sm">
									<li>
										Visit{" "}
										<a
											href="https://nodejs.org"
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1 text-primary underline"
										>
											https://nodejs.org
											<ExternalLink className="h-3 w-3" />
										</a>
									</li>
									<li>
										Download the <strong>LTS (Long Term Support)</strong> version - this is the most
										stable
									</li>
									<li>Run the installer file you downloaded</li>
									<li>
										Follow the installation wizard:
										<ul className="ml-4 mt-1 list-disc space-y-1 text-xs text-muted-foreground">
											<li>Click "Next" through all steps</li>
											<li>Accept the license agreement</li>
											<li>Use default installation location</li>
											<li>Make sure "Add to PATH" is checked (usually checked by default)</li>
										</ul>
									</li>
									<li>Click "Install" and wait for installation to complete</li>
									<li>
										<strong>Important:</strong> Restart your computer after installation
									</li>
								</ol>
							</div>
							<div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
								<div className="mb-2 flex items-center gap-2">
									<CheckCircle2 className="h-4 w-4 text-green-600" />
									<span className="text-sm font-semibold">Verify Installation:</span>
								</div>
								<div className="space-y-2 text-xs">
									<p className="text-muted-foreground">
										Open Terminal (Mac/Linux) or Command Prompt/PowerShell (Windows) and type:
									</p>
									<code className="block rounded-md bg-background p-2 text-xs">
										node --version
									</code>
									<p className="text-muted-foreground">
										You should see something like: <code className="rounded bg-muted px-1">v18.17.0</code> or
										higher. If you see an error, Node.js is not installed correctly.
									</p>
								</div>
							</div>
							<div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
								<div className="mb-2 flex items-center gap-2">
									<AlertCircle className="h-4 w-4 text-yellow-600" />
									<span className="text-sm font-semibold">Troubleshooting:</span>
								</div>
								<ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
									<li>
										If "node" command is not recognized, restart your computer and try again
									</li>
									<li>Make sure you downloaded the LTS version, not the "Current" version</li>
									<li>On Windows, you may need to close and reopen Command Prompt after installation</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* npm */}
				<Card className="mb-6">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Download className="h-5 w-5" />
							</div>
							<div className="flex-1">
								<div className="flex items-center gap-2">
									<CardTitle>npm (Node Package Manager)</CardTitle>
									<Badge variant="destructive">Required</Badge>
								</div>
								<CardDescription>Comes automatically with Node.js - no separate installation needed</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-sm text-muted-foreground">
							npm is a tool that helps download and manage all the code libraries (called "packages") that
							the Pet Care app needs to work. It's like an app store for code.
						</p>
						<div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
							<div className="mb-2 flex items-center gap-2">
								<CheckCircle2 className="h-4 w-4 text-green-600" />
								<span className="text-sm font-semibold">Verify npm is Installed:</span>
							</div>
							<div className="space-y-2 text-xs">
								<p className="text-muted-foreground">In Terminal/Command Prompt, type:</p>
								<code className="block rounded-md bg-background p-2 text-xs">npm --version</code>
								<p className="text-muted-foreground">
									You should see a version number like <code className="rounded bg-muted px-1">9.6.7</code>.
									If npm is not found, Node.js wasn't installed correctly.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* PostgreSQL */}
				<Card className="mb-6">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Download className="h-5 w-5" />
							</div>
							<div className="flex-1">
								<div className="flex items-center gap-2">
									<CardTitle>PostgreSQL Database</CardTitle>
									<Badge variant="destructive">Required</Badge>
								</div>
								<CardDescription>
									Database to store all your application data (pets, users, appointments, etc.)
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-sm text-muted-foreground">
							A database is like a digital filing cabinet that stores all the information your app needs:
							user accounts, pet profiles, appointments, medical records, etc.
						</p>
						<div className="space-y-4">
							<div className="rounded-lg border p-4">
								<h3 className="mb-3 text-sm font-semibold">Option 1: Cloud Database (Recommended for Beginners)</h3>
								<p className="mb-3 text-xs text-muted-foreground">
									Using a cloud database is easier because you don't need to install anything on your
									computer. The database runs on the internet, and you just need a connection string.
								</p>
								<div className="space-y-3">
									<div className="rounded-md bg-muted/50 p-3">
										<h4 className="mb-2 text-xs font-semibold">Supabase (Free Tier Available)</h4>
										<ol className="ml-4 list-decimal space-y-1 text-xs text-muted-foreground">
											<li>
												Visit{" "}
												<a
													href="https://supabase.com"
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-1 text-primary underline"
												>
													https://supabase.com
													<ExternalLink className="h-3 w-3" />
												</a>
											</li>
											<li>Click "Start your project" and sign up (free)</li>
											<li>Create a new project</li>
											<li>Go to Settings → Database</li>
											<li>Copy the "Connection string" (URI format)</li>
											<li>You'll use this in the Configuration step</li>
										</ol>
									</div>
									<div className="rounded-md bg-muted/50 p-3">
										<h4 className="mb-2 text-xs font-semibold">Neon (Free Tier Available)</h4>
										<ol className="ml-4 list-decimal space-y-1 text-xs text-muted-foreground">
											<li>
												Visit{" "}
												<a
													href="https://neon.tech"
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-1 text-primary underline"
												>
													https://neon.tech
													<ExternalLink className="h-3 w-3" />
												</a>
											</li>
											<li>Sign up for a free account</li>
											<li>Create a new project</li>
											<li>Copy the connection string from the dashboard</li>
										</ol>
									</div>
									<div className="rounded-md bg-muted/50 p-3">
										<h4 className="mb-2 text-xs font-semibold">Railway (Free Tier Available)</h4>
										<ol className="ml-4 list-decimal space-y-1 text-xs text-muted-foreground">
											<li>
												Visit{" "}
												<a
													href="https://railway.app"
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-1 text-primary underline"
												>
													https://railway.app
													<ExternalLink className="h-3 w-3" />
												</a>
											</li>
											<li>Sign up with GitHub</li>
											<li>Create a new PostgreSQL database</li>
											<li>Copy the connection string from the Variables tab</li>
										</ol>
									</div>
								</div>
							</div>
							<div className="rounded-lg border p-4">
								<h3 className="mb-3 text-sm font-semibold">Option 2: Install PostgreSQL Locally</h3>
								<p className="mb-3 text-xs text-muted-foreground">
									If you prefer to run the database on your own computer:
								</p>
								<ol className="ml-4 list-decimal space-y-2 text-sm">
									<li>
										Visit{" "}
										<a
											href="https://www.postgresql.org/download"
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1 text-primary underline"
										>
											https://www.postgresql.org/download
											<ExternalLink className="h-3 w-3" />
										</a>
									</li>
									<li>Select your operating system (Windows, Mac, or Linux)</li>
									<li>Download the installer</li>
									<li>
										Run the installer and follow these steps:
										<ul className="ml-4 mt-1 list-disc space-y-1 text-xs text-muted-foreground">
											<li>Use default installation directory</li>
											<li>
												<strong>Important:</strong> Remember the password you set for the "postgres" user
												- you'll need this later!
											</li>
											<li>Use default port (5432)</li>
											<li>Use default locale</li>
										</ul>
									</li>
									<li>After installation, you'll need to create a database (we'll cover this in the Database Setup section)</li>
								</ol>
								<div className="mt-3 rounded-md bg-yellow-500/10 p-3">
									<div className="flex items-start gap-2">
										<AlertCircle className="h-4 w-4 shrink-0 text-yellow-600" />
										<p className="text-xs text-yellow-800 dark:text-yellow-200">
											<strong>Note:</strong> Local PostgreSQL installation is more complex. We recommend
											using a cloud database (Option 1) if you're a beginner.
										</p>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Git (Optional) */}
				<Card className="mb-6">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Download className="h-5 w-5" />
							</div>
							<div className="flex-1">
								<div className="flex items-center gap-2">
									<CardTitle>Git (Version Control)</CardTitle>
									<Badge variant="outline">Optional</Badge>
								</div>
								<CardDescription>Helps download and manage the project code</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-sm text-muted-foreground">
							Git is a tool that helps download code from the internet (like GitHub). You can also download
							the project as a ZIP file if you prefer not to install Git.
						</p>
						<div className="rounded-lg border p-4">
							<h3 className="mb-3 text-sm font-semibold">Installation Steps:</h3>
							<ol className="ml-4 list-decimal space-y-2 text-sm">
								<li>
									Visit{" "}
									<a
										href="https://git-scm.com/downloads"
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 text-primary underline"
									>
										https://git-scm.com/downloads
										<ExternalLink className="h-3 w-3" />
									</a>
								</li>
								<li>Download Git for your operating system</li>
								<li>Run the installer</li>
								<li>Use all default settings (just click "Next" through all steps)</li>
								<li>Restart your computer after installation</li>
							</ol>
							<div className="mt-3 rounded-md bg-muted p-3">
								<p className="text-xs font-medium">Verify Installation:</p>
								<code className="mt-1 block text-xs">git --version</code>
								<p className="mt-2 text-xs text-muted-foreground">
									You should see a version number. If you don't want to install Git, you can download
									the project as a ZIP file instead (covered in Installation Guide).
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Summary */}
				<Card className="border-primary/20 bg-primary/5">
					<CardHeader>
						<CardTitle>Quick Checklist</CardTitle>
						<CardDescription>Make sure you have everything installed before proceeding</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2 text-sm">
							<div className="flex items-center gap-2">
								<CheckCircle2 className="h-4 w-4 text-primary" />
								<span>Node.js version 18 or higher installed and verified</span>
							</div>
							<div className="flex items-center gap-2">
								<CheckCircle2 className="h-4 w-4 text-primary" />
								<span>npm installed and verified (comes with Node.js)</span>
							</div>
							<div className="flex items-center gap-2">
								<CheckCircle2 className="h-4 w-4 text-primary" />
								<span>PostgreSQL database set up (cloud or local)</span>
							</div>
							<div className="flex items-center gap-2">
								<CheckCircle2 className="h-4 w-4 text-muted-foreground" />
								<span className="text-muted-foreground">Git installed (optional - can use ZIP download instead)</span>
							</div>
						</div>
						<p className="mt-4 text-sm text-muted-foreground">
							Once you've completed all required items, proceed to the{" "}
							<a href="#installation" className="font-medium text-primary underline">
								Installation Guide
							</a>
							.
						</p>
					</CardContent>
				</Card>
			</div>
		</section>
	)
}

