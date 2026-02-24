"use client"

import LayoutAuth from "@/components/layout/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect, Suspense } from "react"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"

function ResetPasswordForm() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const token = searchParams.get("token")
	const email = searchParams.get("email")

	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [loading, setLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [validToken, setValidToken] = useState<boolean | null>(null)

	useEffect(() => {
		if (!token || !email) {
			setValidToken(false)
			return
		}

		// Verify token is valid
		const verifyToken = async () => {
			try {
				const res = await fetch(`/api/v1/auth/verify-reset-token?token=${token}&email=${email}`)
				if (res.ok) {
					setValidToken(true)
				} else {
					setValidToken(false)
				}
			} catch {
				setValidToken(false)
			}
		}

		verifyToken()
	}, [token, email])

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		if (password !== confirmPassword) {
			toast.error("Passwords do not match")
			return
		}

		if (password.length < 8) {
			toast.error("Password must be at least 8 characters")
			return
		}

		if (!token || !email) {
			toast.error("Invalid reset link")
			return
		}

		setLoading(true)

		try {
			const res = await fetch("/api/v1/auth/reset-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token, email, password }),
			})

			const data = await res.json()

			if (!res.ok) {
				throw new Error(data.error || "Failed to reset password")
			}

			toast.success("Password reset successfully! Redirecting to sign in...")
			setTimeout(() => {
				router.push("/signin")
			}, 2000)
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to reset password")
		} finally {
			setLoading(false)
		}
	}

	if (validToken === null) {
		return (
			<LayoutAuth>
				<Card className="w-full max-w-md">
					<CardContent className="pt-6">
						<div className="text-center py-8">Verifying reset link...</div>
					</CardContent>
				</Card>
			</LayoutAuth>
		)
	}

	if (validToken === false) {
		return (
			<LayoutAuth>
				<Card className="w-full max-w-md">
					<CardHeader className="text-center space-y-2">
						<CardTitle className="text-3xl font-bold">Invalid Reset Link</CardTitle>
						<CardDescription>The password reset link is invalid or has expired</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Button asChild className="w-full">
							<Link href="/forgot-password">Request New Reset Link</Link>
						</Button>
						<div className="text-center">
							<Link
								href="/signin"
								className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								<ArrowLeft className="w-4 h-4" />
								Back to Sign In
							</Link>
						</div>
					</CardContent>
				</Card>
			</LayoutAuth>
		)
	}

	return (
		<LayoutAuth>
			<Card className="w-full max-w-md">
				<CardHeader className="text-center space-y-2">
					<CardTitle className="text-3xl font-bold">Reset Password</CardTitle>
					<CardDescription>Enter your new password below</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="password">New Password</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="Enter new password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									minLength={8}
									className="pr-10"
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute right-0 top-0 h-full px-3"
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</Button>
							</div>
							<p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<div className="relative">
								<Input
									id="confirmPassword"
									type={showConfirmPassword ? "text" : "password"}
									placeholder="Confirm new password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
									minLength={8}
									className="pr-10"
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute right-0 top-0 h-full px-3"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								>
									{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</Button>
							</div>
						</div>

						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? "Resetting..." : "Reset Password"}
						</Button>
					</form>

					<div className="mt-6 text-center">
						<Link
							href="/signin"
							className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							<ArrowLeft className="w-4 h-4" />
							Back to Sign In
						</Link>
					</div>
				</CardContent>
			</Card>
		</LayoutAuth>
	)
}

export default function ResetPasswordPage() {
	return (
		<Suspense fallback={
			<LayoutAuth>
				<Card className="w-full max-w-md">
					<CardContent className="pt-6">
						<LoadingSpinner size="md" text="Verifying token..." />
					</CardContent>
				</Card>
			</LayoutAuth>
		}>
			<ResetPasswordForm />
		</Suspense>
	)
}

