"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, Copy, Shield, Stethoscope, User, Users } from "lucide-react"
import { useState } from "react"

const TEST_USERS = [
	{
		role: "SUPER_ADMIN",
		label: "Super Admin",
		email: "superadmin@petcare.com",
		password: "password123",
		description: "Full system access, user management, and all administrative features",
		icon: Shield,
		color: "bg-red-500/10 text-red-600 dark:text-red-400",
		badgeColor: "destructive",
	},
	{
		role: "ADMIN",
		label: "Admin",
		email: "admin@petcare.com",
		password: "password123",
		description: "Manage appointments, pets, services, and staff operations",
		icon: User,
		color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
		badgeColor: "default",
	},
	{
		role: "STAFF",
		label: "Staff",
		email: "sarah.johnson@petcare.com",
		password: "password123",
		description: "Access to appointments, medical records, and pet management",
		icon: Stethoscope,
		color: "bg-green-500/10 text-green-600 dark:text-green-400",
		badgeColor: "secondary",
	},
	{
		role: "CUSTOMER",
		label: "Customer",
		email: "john.doe@example.com",
		password: "password123",
		description: "Manage your pets, book appointments, and view medical records",
		icon: Users,
		color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
		badgeColor: "outline",
	},
] as const

export function UserTestLoginInfo() {
	const { toast } = useToast()
	const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

	const copyToClipboard = (text: string, index: number) => {
		navigator.clipboard.writeText(text)
		setCopiedIndex(index)
		toast({
			title: "Copied!",
			description: "Credentials copied to clipboard",
		})
		setTimeout(() => setCopiedIndex(null), 2000)
	}

	return (
		<section id="test-login" className="py-12 sm:py-20 md:py-32">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Test User Accounts</h2>
					<p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">
						Use these pre-configured accounts to test different user roles and permissions
					</p>
				</div>
				<div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-4 sm:mt-16 sm:gap-6 lg:mx-0 lg:max-w-none lg:grid-cols-2 ">
					{TEST_USERS.map((user, index) => {
						const Icon = user.icon
						return (
							<Card key={user.role}>
								<CardHeader>
									<div className="flex flex-col gap-3 sm:flex-row sm:items-start">
										<div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-12 sm:w-12 ${user.color}`}>
											<Icon className="h-5 w-5 sm:h-6 sm:w-6" />
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
												<CardTitle className="text-base sm:text-lg">{user.label}</CardTitle>
												<Badge variant={user.badgeColor as any} className="w-fit text-xs">
													<span className="hidden sm:inline">{user.role}</span>
													<span className="sm:hidden">{user.role.replace("_", " ")}</span>
												</Badge>
											</div>
											<CardDescription className="mt-1 text-sm">{user.description}</CardDescription>
										</div>
									</div>
								</CardHeader>
								<CardContent className="space-y-3 sm:space-y-4">
									<div className="space-y-2 rounded-lg bg-muted/50 p-3 sm:p-4">
										<div className="flex items-center justify-between">
											<span className="text-xs font-medium text-muted-foreground sm:text-sm">Email:</span>
											<Button
												variant="ghost"
												size="sm"
												className="h-6 w-6 shrink-0 p-0"
												onClick={() => copyToClipboard(user.email, index * 2)}
											>
												{copiedIndex === index * 2 ? (
													<CheckCircle2 className="h-4 w-4 text-green-600" />
												) : (
													<Copy className="h-4 w-4" />
												)}
											</Button>
										</div>
										<code className="block break-all text-xs font-mono sm:text-sm">{user.email}</code>
									</div>
									<div className="space-y-2 rounded-lg bg-muted/50 p-3 sm:p-4">
										<div className="flex items-center justify-between">
											<span className="text-xs font-medium text-muted-foreground sm:text-sm">Password:</span>
											<Button
												variant="ghost"
												size="sm"
												className="h-6 w-6 shrink-0 p-0"
												onClick={() => copyToClipboard(user.password, index * 2 + 1)}
											>
												{copiedIndex === index * 2 + 1 ? (
													<CheckCircle2 className="h-4 w-4 text-green-600" />
												) : (
													<Copy className="h-4 w-4" />
												)}
											</Button>
										</div>
										<code className="block break-all text-xs font-mono sm:text-sm">{user.password}</code>
									</div>
									<Button asChild className="w-full" variant="outline">
										<a href="/signin">Sign In as {user.label}</a>
									</Button>
								</CardContent>
							</Card>
						)
					})}
				</div>
				<div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-4 text-center sm:mt-12 sm:p-6">
					<p className="text-xs text-muted-foreground sm:text-sm">
						<strong className="text-foreground">Note:</strong> All test accounts use the same password for
						convenience. These accounts are pre-seeded with sample data including pets, appointments, and
						medical records.
					</p>
				</div>
			</div>
		</section>
	)
}

