"use client"

import { Button } from "@/components/ui/button"
import { USER_ROLES, type UserRole } from "@/lib/constants"
import { Shield, User, UserCog, Users } from "lucide-react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

const ROLE_CONFIG = {
	[USER_ROLES.SUPER_ADMIN]: {
		label: "Super Admin",
		icon: Shield,
		variant: "destructive" as const,
	},
	[USER_ROLES.ADMIN]: {
		label: "Admin",
		icon: UserCog,
		variant: "default" as const,
	},
	[USER_ROLES.STAFF]: {
		label: "Staff",
		icon: Users,
		variant: "secondary" as const,
	},
	[USER_ROLES.CUSTOMER]: {
		label: "Customer",
		icon: User,
		variant: "outline" as const,
	},
} as const

export default function QuickLogin() {
	const router = useRouter()
	const [loading, setLoading] = useState<UserRole | null>(null)

	const handleQuickLogin = async (role: UserRole) => {
		setLoading(role)
		try {
			// Get test credentials from API
			const response = await fetch("/api/v1/auth/quick-login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ role }),
			})

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				throw new Error(errorData.error || `Failed to setup quick login: ${response.status}`)
			}

			const data = await response.json()
			const { email, password } = data

			if (!email || !password) {
				throw new Error("Invalid response from server")
			}

			// Sign in with test credentials
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			})

			if (result?.error) {
				throw new Error(result.error || "Failed to sign in with credentials")
			}

			toast.success(`Signed in as ${ROLE_CONFIG[role].label}`)
			// Use window.location for more reliable redirect on Vercel
			window.location.href = "/customer"
		} catch (error) {
			console.error("Quick login error:", error)
			const errorMessage = error instanceof Error ? error.message : "Failed to quick login"
			toast.error(errorMessage)
		} finally {
			setLoading(null)
		}
	}

	return (
		<div className="space-y-3">
			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-muted" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-card px-2 text-muted-foreground">Quick Login (Test Accounts)</span>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-2">
				{(Object.keys(ROLE_CONFIG) as UserRole[]).map((role) => {
					const config = ROLE_CONFIG[role]
					const Icon = config.icon
					const isLoading = loading === role

					return (
						<Button
							key={role}
							type="button"
							variant={config.variant}
							size="sm"
							className="w-full"
							onClick={() => handleQuickLogin(role)}
							disabled={loading !== null}
						>
							{isLoading ? (
								<>
									<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
									Loading...
								</>
							) : (
								<>
									<Icon className="w-4 h-4 mr-2" />
									{config.label}
								</>
							)}
						</Button>
					)
				})}
			</div>
		</div>
	)
}

