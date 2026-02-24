import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, XCircle, HelpCircle, Lightbulb } from "lucide-react"

export function TroubleshootingGuide() {
	return (
		<section id="troubleshooting" className="scroll-mt-20 bg-muted/50 py-12 sm:py-16 md:py-20">
			<div className="mx-auto max-w-4xl">
				<div className="mb-12 text-center">
					<h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Troubleshooting Guide</h2>
					<p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">
						Common problems and their solutions. Don't panic - most issues have simple fixes!
					</p>
				</div>

				{/* Installation Issues */}
				<Card className="mb-6">
					<CardHeader>
						<div className="flex items-center gap-3">
							<XCircle className="h-5 w-5 text-red-600" />
							<CardTitle>Installation Problems</CardTitle>
						</div>
						<CardDescription>Issues during installation and setup</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="rounded-lg border p-4">
							<h3 className="mb-2 text-sm font-semibold">Problem: "node: command not found" or "npm: command not found"</h3>
							<div className="space-y-2 text-sm">
								<p className="text-muted-foreground">
									<strong>Cause:</strong> Node.js is not installed or not in your system PATH
								</p>
								<p className="font-medium">Solutions:</p>
								<ol className="ml-4 list-decimal space-y-1 text-xs text-muted-foreground">
									<li>Make sure Node.js is installed (check with <code className="rounded bg-muted px-1">node --version</code>)</li>
									<li>Restart your computer after installing Node.js</li>
									<li>Close and reopen your Terminal/Command Prompt</li>
									<li>On Windows, make sure "Add to PATH" was checked during Node.js installation</li>
									<li>Try uninstalling and reinstalling Node.js</li>
								</ol>
							</div>
						</div>

						<div className="rounded-lg border p-4">
							<h3 className="mb-2 text-sm font-semibold">Problem: "npm install" fails with errors</h3>
							<div className="space-y-2 text-sm">
								<p className="text-muted-foreground">
									<strong>Cause:</strong> Network issues, corrupted cache, or permission problems
								</p>
								<p className="font-medium">Solutions:</p>
								<ol className="ml-4 list-decimal space-y-1 text-xs text-muted-foreground">
									<li>Check your internet connection</li>
									<li>Clear npm cache: <code className="rounded bg-muted px-1">npm cache clean --force</code></li>
									<li>Delete <code className="rounded bg-muted px-1">node_modules</code> folder and <code className="rounded bg-muted px-1">package-lock.json</code>, then run <code className="rounded bg-muted px-1">npm install</code> again</li>
									<li>On Windows, try running Command Prompt as Administrator</li>
									<li>On Mac/Linux, try using <code className="rounded bg-muted px-1">sudo npm install</code> (not recommended, but sometimes needed)</li>
									<li>Make sure you're in the correct project directory</li>
								</ol>
							</div>
						</div>

						<div className="rounded-lg border p-4">
							<h3 className="mb-2 text-sm font-semibold">Problem: "Permission denied" errors</h3>
							<div className="space-y-2 text-sm">
								<p className="text-muted-foreground">
									<strong>Cause:</strong> Insufficient permissions to write files
								</p>
								<p className="font-medium">Solutions:</p>
								<ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
									<li>On Windows: Right-click Command Prompt → "Run as Administrator"</li>
									<li>On Mac/Linux: Use <code className="rounded bg-muted px-1">sudo</code> (use carefully)</li>
									<li>Make sure you own the project folder</li>
									<li>Check folder permissions in your file explorer</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Database Issues */}
				<Card className="mb-6">
					<CardHeader>
						<div className="flex items-center gap-3">
							<XCircle className="h-5 w-5 text-red-600" />
							<CardTitle>Database Connection Problems</CardTitle>
						</div>
						<CardDescription>Issues connecting to your database</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="rounded-lg border p-4">
							<h3 className="mb-2 text-sm font-semibold">Problem: "Can't reach database server" or "Connection refused"</h3>
							<div className="space-y-2 text-sm">
								<p className="text-muted-foreground">
									<strong>Cause:</strong> Database is not running, wrong connection string, or firewall blocking connection
								</p>
								<p className="font-medium">Solutions:</p>
								<ol className="ml-4 list-decimal space-y-1 text-xs text-muted-foreground">
									<li>Check your DATABASE_URL in .env.local file</li>
									<li>For local PostgreSQL: Make sure PostgreSQL service is running</li>
									<li>For cloud databases: Verify the connection string is correct</li>
									<li>Check if your firewall is blocking the connection</li>
									<li>Verify database credentials (username, password, host, port)</li>
									<li>For cloud databases: Check if your IP is whitelisted (some services require this)</li>
								</ol>
							</div>
						</div>

						<div className="rounded-lg border p-4">
							<h3 className="mb-2 text-sm font-semibold">Problem: "Authentication failed" or "Invalid password"</h3>
							<div className="space-y-2 text-sm">
								<p className="text-muted-foreground">
									<strong>Cause:</strong> Wrong username or password in DATABASE_URL
								</p>
								<p className="font-medium">Solutions:</p>
								<ol className="ml-4 list-decimal space-y-1 text-xs text-muted-foreground">
									<li>Double-check your database password in .env.local</li>
									<li>Make sure there are no extra spaces in the connection string</li>
									<li>For local PostgreSQL: Try resetting the postgres user password</li>
									<li>For cloud databases: Regenerate the connection string from your dashboard</li>
									<li>URL-encode special characters in password (e.g., @ becomes %40)</li>
								</ol>
							</div>
						</div>

						<div className="rounded-lg border p-4">
							<h3 className="mb-2 text-sm font-semibold">Problem: "Database does not exist"</h3>
							<div className="space-y-2 text-sm">
								<p className="text-muted-foreground">
									<strong>Cause:</strong> The database name in your connection string doesn't exist
								</p>
								<p className="font-medium">Solutions:</p>
								<ol className="ml-4 list-decimal space-y-1 text-xs text-muted-foreground">
									<li>Create the database first (see Database Setup section)</li>
									<li>For local PostgreSQL: Use pgAdmin or command line to create database</li>
									<li>For cloud databases: The database is usually created automatically - check your dashboard</li>
									<li>Verify the database name in your DATABASE_URL matches the actual database name</li>
								</ol>
							</div>
						</div>

						<div className="rounded-lg border p-4">
							<h3 className="mb-2 text-sm font-semibold">Problem: Migration errors or "relation already exists"</h3>
							<div className="space-y-2 text-sm">
								<p className="text-muted-foreground">
									<strong>Cause:</strong> Database tables already exist from a previous migration
								</p>
								<p className="font-medium">Solutions:</p>
								<ol className="ml-4 list-decimal space-y-1 text-xs text-muted-foreground">
									<li>Reset the database: <code className="rounded bg-muted px-1">npx prisma migrate reset</code> (WARNING: This deletes all data!)</li>
									<li>Or use: <code className="rounded bg-muted px-1">npx prisma db push</code> to sync schema without migrations</li>
									<li>Check if you're using the correct database</li>
								</ol>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Running the App Issues */}
				<Card className="mb-6">
					<CardHeader>
						<div className="flex items-center gap-3">
							<XCircle className="h-5 w-5 text-red-600" />
							<CardTitle>Application Runtime Problems</CardTitle>
						</div>
						<CardDescription>Issues when running the application</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="rounded-lg border p-4">
							<h3 className="mb-2 text-sm font-semibold">Problem: "Port 3000 is already in use"</h3>
							<div className="space-y-2 text-sm">
								<p className="text-muted-foreground">
									<strong>Cause:</strong> Another application is using port 3000
								</p>
								<p className="font-medium">Solutions:</p>
								<ol className="ml-4 list-decimal space-y-1 text-xs text-muted-foreground">
									<li>Close the other application using port 3000</li>
									<li>Or use a different port: <code className="rounded bg-muted px-1">PORT=3001 npm run dev</code></li>
									<li>Then access the app at <code className="rounded bg-muted px-1">http://localhost:3001</code></li>
									<li>On Windows: Find and close the process: <code className="rounded bg-muted px-1">netstat -ano | findstr :3000</code></li>
								</ol>
							</div>
						</div>

						<div className="rounded-lg border p-4">
							<h3 className="mb-2 text-sm font-semibold">Problem: "NEXTAUTH_SECRET is not set"</h3>
							<div className="space-y-2 text-sm">
								<p className="text-muted-foreground">
									<strong>Cause:</strong> Missing or incorrect NEXTAUTH_SECRET in .env.local
								</p>
								<p className="font-medium">Solutions:</p>
								<ol className="ml-4 list-decimal space-y-1 text-xs text-muted-foreground">
									<li>Make sure .env.local file exists in the project root</li>
									<li>Add NEXTAUTH_SECRET to .env.local (see Configuration Guide)</li>
									<li>Generate a new secret: <code className="rounded bg-muted px-1">openssl rand -base64 32</code></li>
									<li>Restart the development server after adding the variable</li>
								</ol>
							</div>
						</div>

						<div className="rounded-lg border p-4">
							<h3 className="mb-2 text-sm font-semibold">Problem: "Module not found" errors</h3>
							<div className="space-y-2 text-sm">
								<p className="text-muted-foreground">
									<strong>Cause:</strong> Dependencies not installed or corrupted
								</p>
								<p className="font-medium">Solutions:</p>
								<ol className="ml-4 list-decimal space-y-1 text-xs text-muted-foreground">
									<li>Delete <code className="rounded bg-muted px-1">node_modules</code> folder</li>
									<li>Delete <code className="rounded bg-muted px-1">package-lock.json</code></li>
									<li>Run <code className="rounded bg-muted px-1">npm install</code> again</li>
									<li>Make sure you're in the correct project directory</li>
								</ol>
							</div>
						</div>

						<div className="rounded-lg border p-4">
							<h3 className="mb-2 text-sm font-semibold">Problem: App loads but shows blank page or errors</h3>
							<div className="space-y-2 text-sm">
								<p className="text-muted-foreground">
									<strong>Cause:</strong> JavaScript errors, missing environment variables, or database issues
								</p>
								<p className="font-medium">Solutions:</p>
								<ol className="ml-4 list-decimal space-y-1 text-xs text-muted-foreground">
									<li>Open browser Developer Tools (F12) and check Console tab for errors</li>
									<li>Check Terminal/Command Prompt for server-side errors</li>
									<li>Verify all required environment variables are set in .env.local</li>
									<li>Make sure database is running and accessible</li>
									<li>Try clearing browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)</li>
								</ol>
							</div>
						</div>

						<div className="rounded-lg border p-4">
							<h3 className="mb-2 text-sm font-semibold">Problem: "Prisma Client" errors</h3>
							<div className="space-y-2 text-sm">
								<p className="text-muted-foreground">
									<strong>Cause:</strong> Prisma Client not generated or out of sync
								</p>
								<p className="font-medium">Solutions:</p>
								<ol className="ml-4 list-decimal space-y-1 text-xs text-muted-foreground">
									<li>Run <code className="rounded bg-muted px-1">npx prisma generate</code></li>
									<li>Make sure DATABASE_URL is correct in .env.local</li>
									<li>Run <code className="rounded bg-muted px-1">npx prisma migrate dev</code> to sync database</li>
									<li>Restart the development server</li>
								</ol>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Login/Authentication Issues */}
				<Card className="mb-6">
					<CardHeader>
						<div className="flex items-center gap-3">
							<XCircle className="h-5 w-5 text-red-600" />
							<CardTitle>Login and Authentication Problems</CardTitle>
						</div>
						<CardDescription>Issues with signing in or authentication</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="rounded-lg border p-4">
							<h3 className="mb-2 text-sm font-semibold">Problem: Can't sign in with credentials</h3>
							<div className="space-y-2 text-sm">
								<p className="text-muted-foreground">
									<strong>Cause:</strong> Wrong credentials, user doesn't exist, or database not seeded
								</p>
								<p className="font-medium">Solutions:</p>
								<ol className="ml-4 list-decimal space-y-1 text-xs text-muted-foreground">
									<li>Make sure you ran <code className="rounded bg-muted px-1">npm run db:seed</code> to create test users</li>
									<li>Check that you're using the correct email and password</li>
									<li>Try creating a new account instead</li>
									<li>Check database to see if users exist: <code className="rounded bg-muted px-1">npx prisma studio</code></li>
								</ol>
							</div>
						</div>

						<div className="rounded-lg border p-4">
							<h3 className="mb-2 text-sm font-semibold">Problem: "Google Sign In" doesn't work</h3>
							<div className="space-y-2 text-sm">
								<p className="text-muted-foreground">
									<strong>Cause:</strong> Google OAuth not configured or incorrect credentials
								</p>
								<p className="font-medium">Solutions:</p>
								<ol className="ml-4 list-decimal space-y-1 text-xs text-muted-foreground">
									<li>Make sure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in .env.local</li>
									<li>Verify redirect URI in Google Cloud Console matches: <code className="rounded bg-muted px-1">http://localhost:3000/api/auth/callback/google</code></li>
									<li>Check that Google+ API is enabled in Google Cloud Console</li>
									<li>Google OAuth is optional - you can use email/password login instead</li>
								</ol>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* General Tips */}
				<Card className="border-primary/20 bg-primary/5">
					<CardHeader>
						<div className="flex items-center gap-3">
							<Lightbulb className="h-5 w-5 text-primary" />
							<CardTitle>General Troubleshooting Tips</CardTitle>
						</div>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="space-y-2 text-sm">
							<div className="flex items-start gap-2">
								<CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
								<span className="text-xs text-muted-foreground">
									<strong>Always check the error message:</strong> Error messages usually tell you exactly what's wrong. Read them carefully.
								</span>
							</div>
							<div className="flex items-start gap-2">
								<CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
								<span className="text-xs text-muted-foreground">
									<strong>Restart everything:</strong> Sometimes a simple restart of the server, database, or computer fixes issues.
								</span>
							</div>
							<div className="flex items-start gap-2">
								<CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
								<span className="text-xs text-muted-foreground">
									<strong>Check file locations:</strong> Make sure .env.local is in the project root (same folder as package.json).
								</span>
							</div>
							<div className="flex items-start gap-2">
								<CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
								<span className="text-xs text-muted-foreground">
									<strong>Verify environment variables:</strong> Make sure there are no typos, extra spaces, or missing quotes in .env.local.
								</span>
							</div>
							<div className="flex items-start gap-2">
								<CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
								<span className="text-xs text-muted-foreground">
									<strong>Check logs:</strong> Look at both browser console (F12) and terminal output for detailed error messages.
								</span>
							</div>
							<div className="flex items-start gap-2">
								<CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
								<span className="text-xs text-muted-foreground">
									<strong>One step at a time:</strong> Don't change multiple things at once. Fix one issue, test, then move to the next.
								</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Getting Help */}
				<Card className="mt-6 border-blue-500/20 bg-blue-500/5">
					<CardHeader>
						<div className="flex items-center gap-3">
							<HelpCircle className="h-5 w-5 text-blue-600" />
							<CardTitle>Still Need Help?</CardTitle>
						</div>
					</CardHeader>
					<CardContent className="space-y-3">
						<p className="text-sm text-muted-foreground">
							If you've tried all the solutions above and still have issues:
						</p>
						<ul className="ml-4 list-disc space-y-2 text-sm">
							<li className="text-xs text-muted-foreground">
								Check the error message carefully - it often contains the solution
							</li>
							<li className="text-xs text-muted-foreground">
								Search for the exact error message online - someone else has likely encountered it
							</li>
							<li className="text-xs text-muted-foreground">
								Make sure you've followed all steps in the Installation and Configuration guides
							</li>
							<li className="text-xs text-muted-foreground">
								Verify your system meets all prerequisites (Node.js version, etc.)
							</li>
							<li className="text-xs text-muted-foreground">
								Check project documentation or GitHub issues for known problems
							</li>
						</ul>
					</CardContent>
				</Card>
			</div>
		</section>
	)
}

