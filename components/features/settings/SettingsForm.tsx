"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type React from "react"
import { useState } from "react"
import { toast } from "sonner"

export function SettingsForm() {
	const [currentPassword, setCurrentPassword] = useState("")
	const [newPassword, setNewPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [loading, setLoading] = useState(false)
	const [emailNotifications, setEmailNotifications] = useState(true)
	const [smsNotifications, setSmsNotifications] = useState(false)
	const [promotionalEmails, setPromotionalEmails] = useState(false)

	const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		if (newPassword !== confirmPassword) {
			toast.error("Passwords do not match")
			return
		}

		if (newPassword.length < 6) {
			toast.error("Password must be at least 8 characters")
			return
		}

		setLoading(true)
		try {
			const res = await fetch("/api/v1/user/password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ currentPassword, newPassword }),
			})

			if (!res.ok) {
				const error = await res.json()
				throw new Error(error.error || "Failed to update password")
			}

			toast.success("Password updated successfully")
			setCurrentPassword("")
			setNewPassword("")
			setConfirmPassword("")
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to update password")
		} finally {
			setLoading(false)
		}
	}

	const handlePreferencesSave = async () => {
		try {
			const res = await fetch("/api/v1/user/settings", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					emailNotifications,
					smsNotifications,
					promotionalEmails,
				}),
			})

			if (!res.ok) throw new Error("Failed to save preferences")
			toast.success("Preferences saved successfully")
		} catch (error) {
			toast.error("Failed to save preferences")
		}
	}

	return (
		<Tabs defaultValue="password" className="w-full">
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="password">Change Password</TabsTrigger>
				<TabsTrigger value="preferences">Preferences</TabsTrigger>
			</TabsList>

			<TabsContent value="password">
				<Card className="p-6">
					<form onSubmit={handlePasswordChange} className="space-y-6">
						<div>
							<Label htmlFor="current-password">Current Password</Label>
							<Input
								id="current-password"
								type="password"
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
								className="mt-2"
								placeholder="Enter current password"
								required
							/>
						</div>

						<div>
							<Label htmlFor="new-password">New Password</Label>
							<Input
								id="new-password"
								type="password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								className="mt-2"
								placeholder="Enter new password"
								required
							/>
						</div>

						<div>
							<Label htmlFor="confirm-password">Confirm Password</Label>
							<Input
								id="confirm-password"
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="mt-2"
								placeholder="Confirm new password"
								required
							/>
						</div>

						<Button type="submit" disabled={loading} className="w-full">
							{loading ? "Updating..." : "Update Password"}
						</Button>
					</form>
				</Card>
			</TabsContent>

			<TabsContent value="preferences">
				<Card>
					<CardHeader>
						<CardTitle>Notification Preferences</CardTitle>
						<CardDescription>Manage how you receive notifications and communications</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<Label htmlFor="email-notifications">Email Notifications</Label>
								<p className="text-sm text-muted-foreground">Receive updates via email</p>
							</div>
							<Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<Label htmlFor="sms-notifications">SMS Notifications</Label>
								<p className="text-sm text-muted-foreground">Receive updates via SMS</p>
							</div>
							<Switch id="sms-notifications" checked={smsNotifications} onCheckedChange={setSmsNotifications} />
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<Label htmlFor="promotional-emails">Promotional Emails</Label>
								<p className="text-sm text-muted-foreground">Receive special offers and promotions</p>
							</div>
							<Switch id="promotional-emails" checked={promotionalEmails} onCheckedChange={setPromotionalEmails} />
						</div>

						<Button onClick={handlePreferencesSave} className="w-full">
							Save Preferences
						</Button>
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>
	)
}
