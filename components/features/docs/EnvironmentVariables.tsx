import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, AlertCircle, CheckCircle2 } from "lucide-react"

const ENV_VARIABLES = [
	{
		name: "DATABASE_URL",
		required: true,
		description: "PostgreSQL database connection string",
		example: 'postgresql://user:password@localhost:5432/petcare?schema=public',
		category: "Database",
	},
	{
		name: "DIRECT_URL",
		required: true,
		description: "Direct database connection URL (same as DATABASE_URL for most cases)",
		example: 'postgresql://user:password@localhost:5432/petcare?schema=public',
		category: "Database",
	},
	{
		name: "NEXTAUTH_SECRET",
		required: true,
		description: "Secret key for NextAuth authentication (generate with: openssl rand -base64 32)",
		example: "your-generated-secret-key-minimum-32-characters-long",
		category: "Authentication",
	},
	{
		name: "NEXTAUTH_URL",
		required: false,
		description: "Base URL of your application (auto-detected in production)",
		example: "http://localhost:3000",
		category: "Authentication",
	},
	{
		name: "GOOGLE_CLIENT_ID",
		required: false,
		description: "Google OAuth Client ID for social login",
		example: "your-google-client-id.apps.googleusercontent.com",
		category: "OAuth",
	},
	{
		name: "GOOGLE_CLIENT_SECRET",
		required: false,
		description: "Google OAuth Client Secret",
		example: "your-google-client-secret",
		category: "OAuth",
	},
	{
		name: "CLOUDINARY_CLOUD_NAME",
		required: false,
		description: "Cloudinary cloud name for image uploads",
		example: "your-cloud-name",
		category: "Cloudinary",
	},
	{
		name: "CLOUDINARY_API_KEY",
		required: false,
		description: "Cloudinary API key",
		example: "your-api-key",
		category: "Cloudinary",
	},
	{
		name: "CLOUDINARY_API_SECRET",
		required: false,
		description: "Cloudinary API secret",
		example: "your-api-secret",
		category: "Cloudinary",
	},
	{
		name: "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET",
		required: false,
		description: "Cloudinary upload preset name",
		example: "pet-care-uploads",
		category: "Cloudinary",
	},
	{
		name: "NEXT_PUBLIC_CLOUDINARY_FOLDER",
		required: false,
		description: "Cloudinary folder name for organizing uploads",
		example: "pet-care",
		category: "Cloudinary",
	},
	{
		name: "STRIPE_SECRET_KEY",
		required: false,
		description: "Stripe secret key for payment processing",
		example: "sk_test_your-secret-key",
		category: "Stripe",
	},
	{
		name: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
		required: false,
		description: "Stripe publishable key for client-side",
		example: "pk_test_your-publishable-key",
		category: "Stripe",
	},
	{
		name: "RESEND_API_KEY",
		required: false,
		description: "Resend API key for email functionality",
		example: "re_your-api-key",
		category: "Email",
	},
]

export function EnvironmentVariables() {
	const requiredVars = ENV_VARIABLES.filter((v) => v.required)
	const optionalVars = ENV_VARIABLES.filter((v) => !v.required)

	return (
		<section id="env-variables" className="scroll-mt-20 py-12 sm:py-16 md:py-20">
			<div className="mx-auto max-w-4xl">
				<div className="mb-12 text-center">
					<h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Environment Variables</h2>
					<p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">
						Quick reference guide for all environment variables used in the application
					</p>
				</div>

				{/* Required Variables */}
				<Card className="mb-8">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
								<AlertCircle className="h-5 w-5" />
							</div>
							<div>
								<CardTitle>Required Variables</CardTitle>
								<CardDescription>These must be set for the application to work</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{requiredVars.map((variable) => (
								<div key={variable.name} className="rounded-lg border p-4">
									<div className="mb-2 flex items-center gap-2">
										<Badge variant="destructive">Required</Badge>
										<code className="text-sm font-semibold">{variable.name}</code>
										<Badge variant="outline" className="text-xs">
											{variable.category}
										</Badge>
									</div>
									<p className="mb-2 text-sm text-muted-foreground">{variable.description}</p>
									<div className="rounded-md bg-muted p-3">
										<code className="block break-all text-xs">{variable.example}</code>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Optional Variables */}
				<Card className="mb-8">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Code className="h-5 w-5" />
							</div>
							<div>
								<CardTitle>Optional Variables</CardTitle>
								<CardDescription>These enable additional features but are not required</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{optionalVars.map((variable) => (
								<div key={variable.name} className="rounded-lg border p-4">
									<div className="mb-2 flex items-center gap-2">
										<Badge variant="secondary">Optional</Badge>
										<code className="text-sm font-semibold">{variable.name}</code>
										<Badge variant="outline" className="text-xs">
											{variable.category}
										</Badge>
									</div>
									<p className="mb-2 text-sm text-muted-foreground">{variable.description}</p>
									<div className="rounded-md bg-muted p-3">
										<code className="block break-all text-xs">{variable.example}</code>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Quick Copy Template */}
				<Card className="border-primary/20 bg-primary/5">
					<CardHeader>
						<div className="flex items-center gap-3">
							<CheckCircle2 className="h-5 w-5 text-primary" />
							<CardTitle>Quick Copy Template</CardTitle>
							<CardDescription>Copy this template to your .env.local file</CardDescription>
						</div>
					</CardHeader>
					<CardContent>
						<div className="rounded-lg border bg-muted/50 p-4">
							<code className="block whitespace-pre-wrap text-xs">
								{`# Database Configuration (REQUIRED)
DATABASE_URL="postgresql://user:password@localhost:5432/petcare?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/petcare?schema=public"

# Authentication (REQUIRED)
NEXTAUTH_SECRET="your-generated-secret-key-minimum-32-characters-long"

# Google OAuth (OPTIONAL)
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Cloudinary (OPTIONAL)
# CLOUDINARY_CLOUD_NAME="your-cloud-name"
# CLOUDINARY_API_KEY="your-api-key"
# CLOUDINARY_API_SECRET="your-api-secret"
# NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-upload-preset"
# NEXT_PUBLIC_CLOUDINARY_FOLDER="pet-care"

# Stripe (OPTIONAL)
# STRIPE_SECRET_KEY="sk_test_your-secret-key"
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-publishable-key"

# Resend Email (OPTIONAL)
# RESEND_API_KEY="re_your-api-key"`}
							</code>
						</div>
						<p className="mt-4 text-xs text-muted-foreground">
							<strong>Note:</strong> Replace placeholder values with your actual credentials. Lines starting with # are comments and are ignored.
						</p>
					</CardContent>
				</Card>
			</div>
		</section>
	)
}

