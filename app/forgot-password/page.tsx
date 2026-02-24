"use client"

import LayoutAuth from "@/components/layout/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { toast } from "sonner"
import Link from "next/link"
import { ArrowLeft, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("")
	const [loading, setLoading] = useState(false)
	const [sent, setSent] = useState(false)

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setLoading(true)

		try {
			const res = await fetch("/api/v1/auth/forgot-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			})

			const data = await res.json()

			if (!res.ok) {
				throw new Error(data.error || "Failed to send reset email")
			}

			setSent(true)
			toast.success("Password reset email sent! Check your inbox.")
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to send reset email")
		} finally {
			setLoading(false)
		}
	}

	return (
		<LayoutAuth>
			<Card className="w-full max-w-md">
				<CardHeader className="text-center space-y-2">
					<CardTitle className="text-3xl font-bold">Forgot Password</CardTitle>
					<CardDescription>
						{sent
							? "Check your email for password reset instructions"
							: "Enter your email address and we'll send you a link to reset your password"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{sent ? (
						<div className="space-y-4 text-center">
							<div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
								<Mail className="w-8 h-8 text-primary" />
							</div>
							<p className="text-sm text-muted-foreground">
								We've sent a password reset link to <strong>{email}</strong>
							</p>
							<p className="text-xs text-muted-foreground">
								Didn't receive the email? Check your spam folder or try again.
							</p>
							<Button
								variant="outline"
								className="w-full"
								onClick={() => {
									setSent(false)
									setEmail("")
								}}
							>
								Resend Email
							</Button>
						</div>
					) : (
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email">Email Address</Label>
								<Input
									id="email"
									type="email"
									placeholder="you@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									autoFocus
								/>
							</div>
							<Button type="submit" className="w-full" disabled={loading}>
								{loading ? "Sending..." : "Send Reset Link"}
							</Button>
						</form>
					)}

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

