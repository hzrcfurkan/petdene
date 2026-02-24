import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, FileText, Key, AlertCircle } from "lucide-react"

export function ConfigurationGuide() {
	return (
		<section id="configuration" className="scroll-mt-20 bg-muted/50 py-12 sm:py-16 md:py-20">
			<div className="mx-auto max-w-4xl">
				<div className="mb-12 text-center">
					<h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Configuration Guide</h2>
					<p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">
						Set up environment variables and configure your application settings
					</p>
				</div>

				{/* Create .env file */}
				<Card className="mb-8">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<FileText className="h-5 w-5" />
							</div>
							<div>
								<CardTitle>Step 1: Create Environment File</CardTitle>
								<CardDescription>Create a file to store your configuration settings</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-sm text-muted-foreground">
							Environment variables are secret settings that your application needs to run. They should
							never be shared publicly.
						</p>
						<div className="space-y-4">
							<div className="rounded-lg border p-4">
								<h3 className="mb-2 text-sm font-semibold">Create .env.local file</h3>
								<ol className="ml-4 list-decimal space-y-2 text-sm">
									<li>In your project folder, create a new file named <code className="rounded bg-muted px-1 py-0.5 text-xs">.env.local</code></li>
									<li>
										<strong>Important:</strong> Make sure the file starts with a dot (.) - this makes it
										hidden on some systems
									</li>
									<li>Open the file in a text editor (Notepad, VS Code, etc.)</li>
								</ol>
								<div className="mt-3 rounded-md bg-muted p-3">
									<p className="mb-2 text-xs font-medium">File location:</p>
									<code className="block text-xs">pet-care/.env.local</code>
									<p className="mt-2 text-xs text-muted-foreground">
										This file should be in the same folder as package.json
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Required Variables */}
				<Card className="mb-8">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Key className="h-5 w-5" />
							</div>
							<div>
								<CardTitle>Step 2: Add Required Environment Variables</CardTitle>
								<CardDescription>Copy these variables into your .env.local file</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
							<div className="mb-3 flex items-start gap-2">
								<AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
								<div>
									<p className="text-sm font-semibold text-red-900 dark:text-red-100">
										Critical: Required for Application to Work
									</p>
									<p className="mt-1 text-xs text-red-800 dark:text-red-200">
										These variables must be set correctly or the app will not run
									</p>
								</div>
							</div>
						</div>

						{/* DATABASE_URL */}
						<div className="rounded-lg border p-4">
							<div className="mb-3 flex items-center gap-2">
								<Badge variant="destructive">Required</Badge>
								<span className="font-semibold">DATABASE_URL</span>
							</div>
							<p className="mb-3 text-sm text-muted-foreground">
								The connection string to your PostgreSQL database. This tells the app where to find and
								connect to your database.
							</p>
							<div className="space-y-3">
								<div>
									<p className="mb-2 text-xs font-medium">For Local PostgreSQL:</p>
									<code className="block rounded-md bg-muted p-3 text-xs">
										DATABASE_URL="postgresql://username:password@localhost:5432/petcare?schema=public"
									</code>
									<p className="mt-2 text-xs text-muted-foreground">
										Replace:
										<br />• <strong>username</strong> with your PostgreSQL username (usually "postgres")
										<br />• <strong>password</strong> with your PostgreSQL password
										<br />• <strong>petcare</strong> with your database name
									</p>
								</div>
								<div>
									<p className="mb-2 text-xs font-medium">For Cloud Database (Supabase/Neon/Railway):</p>
									<code className="block rounded-md bg-muted p-3 text-xs break-all">
										DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
									</code>
									<p className="mt-2 text-xs text-muted-foreground">
										Copy the connection string directly from your cloud database dashboard. It usually
										looks like the example above.
									</p>
								</div>
							</div>
						</div>

						{/* DIRECT_URL */}
						<div className="rounded-lg border p-4">
							<div className="mb-3 flex items-center gap-2">
								<Badge variant="destructive">Required</Badge>
								<span className="font-semibold">DIRECT_URL</span>
							</div>
							<p className="mb-3 text-sm text-muted-foreground">
								Direct connection URL for database migrations. Usually the same as DATABASE_URL.
							</p>
							<code className="block rounded-md bg-muted p-3 text-xs">
								DIRECT_URL="postgresql://username:password@localhost:5432/petcare?schema=public"
							</code>
							<p className="mt-2 text-xs text-muted-foreground">
								Use the same value as DATABASE_URL (or copy your connection string again)
							</p>
						</div>

						{/* NEXTAUTH_SECRET */}
						<div className="rounded-lg border p-4">
							<div className="mb-3 flex items-center gap-2">
								<Badge variant="destructive">Required</Badge>
								<span className="font-semibold">NEXTAUTH_SECRET</span>
							</div>
							<p className="mb-3 text-sm text-muted-foreground">
								A secret key used to encrypt session data. This must be a random, secure string.
							</p>
							<div className="space-y-3">
								<div>
									<p className="mb-2 text-xs font-medium">Generate a secret (choose one method):</p>
									<div className="space-y-2">
										<div className="rounded-md bg-muted p-3">
											<p className="mb-1 text-xs font-medium">Method 1: Using OpenSSL (Mac/Linux):</p>
											<code className="block text-xs">openssl rand -base64 32</code>
										</div>
										<div className="rounded-md bg-muted p-3">
											<p className="mb-1 text-xs font-medium">Method 2: Using Node.js:</p>
											<code className="block text-xs">node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"</code>
										</div>
										<div className="rounded-md bg-muted p-3">
											<p className="mb-1 text-xs font-medium">Method 3: Online Generator:</p>
											<p className="text-xs">
												Visit{" "}
												<a
													href="https://generate-secret.vercel.app/32"
													target="_blank"
													rel="noopener noreferrer"
													className="text-primary underline"
												>
													https://generate-secret.vercel.app/32
												</a>
											</p>
										</div>
									</div>
								</div>
								<div>
									<p className="mb-2 text-xs font-medium">Add to .env.local:</p>
									<code className="block rounded-md bg-muted p-3 text-xs">
										NEXTAUTH_SECRET="your-generated-secret-key-here"
									</code>
									<p className="mt-2 text-xs text-muted-foreground">
										Replace "your-generated-secret-key-here" with the actual secret you generated
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Optional Variables */}
				<Card className="mb-8">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Key className="h-5 w-5" />
							</div>
							<div>
								<CardTitle>Step 3: Optional Environment Variables</CardTitle>
								<CardDescription>Add these only if you need specific features</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-sm text-muted-foreground">
							These variables are optional. The app will work without them, but some features may be
							limited.
						</p>

						{/* Google OAuth */}
						<div className="rounded-lg border p-4">
							<div className="mb-3 flex items-center gap-2">
								<Badge variant="secondary">Optional</Badge>
								<span className="font-semibold">Google OAuth (Sign in with Google)</span>
							</div>
							<p className="mb-3 text-sm text-muted-foreground">
								Allow users to sign in using their Google account.
							</p>
							<div className="space-y-2 text-sm">
								<p className="font-medium">How to set up:</p>
								<ol className="ml-4 list-decimal space-y-2 text-xs">
									<li>
										Go to{" "}
										<a
											href="https://console.cloud.google.com"
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary underline"
										>
											Google Cloud Console
										</a>
									</li>
									<li>Create a new project or select existing one</li>
									<li>Enable Google+ API</li>
									<li>Create OAuth 2.0 credentials</li>
									<li>Add authorized redirect URI: http://localhost:3000/api/auth/callback/google</li>
									<li>Copy Client ID and Client Secret</li>
								</ol>
								<div className="mt-3 rounded-md bg-muted p-3">
									<code className="block text-xs">
										GOOGLE_CLIENT_ID="your-google-client-id"
										<br />
										GOOGLE_CLIENT_SECRET="your-google-client-secret"
									</code>
								</div>
							</div>
						</div>

						{/* Cloudinary */}
						<div className="rounded-lg border p-4">
							<div className="mb-3 flex items-center gap-2">
								<Badge variant="secondary">Optional</Badge>
								<span className="font-semibold">Cloudinary (Image Uploads)</span>
							</div>
							<p className="mb-3 text-sm text-muted-foreground">
								Enable image uploads for pet photos and user avatars.
							</p>
							<div className="space-y-2 text-sm">
								<ol className="ml-4 list-decimal space-y-2 text-xs">
									<li>
										Sign up at{" "}
										<a
											href="https://cloudinary.com"
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary underline"
										>
											cloudinary.com
										</a>{" "}
										(free tier available)
									</li>
									<li>Get your Cloud Name, API Key, and API Secret from dashboard</li>
									<li>Create an upload preset</li>
								</ol>
								<div className="mt-3 rounded-md bg-muted p-3">
									<code className="block text-xs">
										NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
										<br />
										CLOUDINARY_API_KEY="your-api-key"
										<br />
										CLOUDINARY_API_SECRET="your-api-secret"
										<br />
										NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-upload-preset"
										<br />
										NEXT_PUBLIC_CLOUDINARY_FOLDER="pet-care"
									</code>
								</div>
							</div>
						</div>

						{/* Stripe */}
						<div className="rounded-lg border p-4">
							<div className="mb-3 flex items-center gap-2">
								<Badge variant="secondary">Optional</Badge>
								<span className="font-semibold">Stripe (Payment Processing)</span>
							</div>
							<p className="mb-3 text-sm text-muted-foreground">
								Enable payment processing for invoices and subscriptions.
							</p>
							<div className="space-y-2 text-sm">
								<ol className="ml-4 list-decimal space-y-2 text-xs">
									<li>
										Sign up at{" "}
										<a
											href="https://stripe.com"
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary underline"
										>
											stripe.com
										</a>
									</li>
									<li>Get your API keys from the dashboard</li>
									<li>Use test keys for development</li>
								</ol>
								<div className="mt-3 rounded-md bg-muted p-3">
									<code className="block text-xs">
										STRIPE_SECRET_KEY="sk_test_your-secret-key"
										<br />
										NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-publishable-key"
									</code>
								</div>
							</div>
						</div>

						{/* Resend */}
						<div className="rounded-lg border p-4">
							<div className="mb-3 flex items-center gap-2">
								<Badge variant="secondary">Optional</Badge>
								<span className="font-semibold">Resend (Email Sending)</span>
							</div>
							<p className="mb-3 text-sm text-muted-foreground">
								Enable email functionality for password reset and notifications.
							</p>
							<div className="space-y-2 text-sm">
								<ol className="ml-4 list-decimal space-y-2 text-xs">
									<li>
										Sign up at{" "}
										<a
											href="https://resend.com"
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary underline"
										>
											resend.com
										</a>
									</li>
									<li>Get your API key from the dashboard</li>
								</ol>
								<div className="mt-3 rounded-md bg-muted p-3">
									<code className="block text-xs">RESEND_API_KEY="re_your-api-key"</code>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Example .env.local */}
				<Card className="mb-8">
					<CardHeader>
						<CardTitle>Complete .env.local Example</CardTitle>
						<CardDescription>Here's what a complete .env.local file looks like</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="rounded-lg border bg-muted/50 p-4">
							<code className="block whitespace-pre-wrap text-xs">
								{`# Database Configuration (REQUIRED)
DATABASE_URL="postgresql://postgres:password@localhost:5432/petcare?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/petcare?schema=public"

# Authentication (REQUIRED)
NEXTAUTH_SECRET="your-generated-secret-key-minimum-32-characters-long"

# Google OAuth (OPTIONAL)
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Cloudinary (OPTIONAL)
# NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
# CLOUDINARY_API_KEY="your-api-key"
# CLOUDINARY_API_SECRET="your-api-secret"
# NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-upload-preset"
# NEXT_PUBLIC_CLOUDINARY_FOLDER="pet-care"

# Stripe (OPTIONAL)
# STRIPE_SECRET_KEY="sk_test_your-secret-key"
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-publishable-key"

# Resend (OPTIONAL)
# RESEND_API_KEY="re_your-api-key"`}
							</code>
						</div>
						<div className="mt-4 rounded-lg border border-green-500/20 bg-green-500/5 p-4">
							<div className="flex items-start gap-2">
								<CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
								<div>
									<p className="text-sm font-medium text-green-900 dark:text-green-100">
										Important Notes:
									</p>
									<ul className="mt-2 space-y-1 text-xs text-green-800 dark:text-green-200">
										<li>• Lines starting with # are comments (ignored by the app)</li>
										<li>• Never share your .env.local file or commit it to Git</li>
										<li>• Replace all placeholder values with your actual credentials</li>
										<li>• Keep quotes around values</li>
									</ul>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Next Steps */}
				<Card className="border-primary/20 bg-primary/5">
					<CardHeader>
						<CardTitle>What's Next?</CardTitle>
						<CardDescription>Continue to Running the App</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							After setting up your environment variables, proceed to the{" "}
							<a href="#running" className="font-medium text-primary underline">
								Running the App
							</a>{" "}
							section to start your application.
						</p>
					</CardContent>
				</Card>
			</div>
		</section>
	)
}

