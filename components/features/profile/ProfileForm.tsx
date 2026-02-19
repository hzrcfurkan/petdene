"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getRoleLabel } from "@/lib/auth/client"
import React, { useEffect, useState } from "react"
import { toast } from "sonner"
import ImageUpload from "./ImageUpload"
import { ProfileFormSkeleton } from "@/components/skeletons"

interface UserProfile {
	id: string
	name: string | null
	email: string
	phone: string | null
	image: string | null
	role: string
	createdAt: string
}

export function ProfileForm() {
	const [profile, setProfile] = useState<UserProfile | null>(null)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)

	useEffect(() => {
		fetchProfile()
	}, [])

	const fetchProfile = async () => {
		try {
			const res = await fetch("/api/v1/user/profile")
			if (!res.ok) throw new Error("Failed to fetch profile")
			const data = await res.json()
			setProfile(data)
		} catch (error) {
			toast.error("Failed to load profile")
		} finally {
			setLoading(false)
		}
	}

	const handleImageUpload = async (imageUrl: string) => {
		if (!profile) return
		setSaving(true)
		try {
			const res = await fetch("/api/v1/user/profile", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: profile.name,
					phone: profile.phone,
					image: imageUrl,
				}),
			})
			if (!res.ok) throw new Error("Failed to update profile")
			setProfile({ ...profile, image: imageUrl })
			toast.success("Profile picture updated successfully")
		} catch (error) {
			toast.error("Failed to update profile picture")
		} finally {
			setSaving(false)
		}
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!profile) return

		setSaving(true)
		try {
			const res = await fetch("/api/v1/user/profile", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: profile.name,
					phone: profile.phone,
				}),
			})
			if (!res.ok) throw new Error("Failed to update profile")
			toast.success("Profile updated successfully")
		} catch (error) {
			toast.error("Failed to update profile")
		} finally {
			setSaving(false)
		}
	}

	if (loading) return <ProfileFormSkeleton />
	if (!profile) return <div className="text-center py-8 text-destructive">Failed to load profile</div>

	return (
		<div className="space-y-6">
			{/* Profile Picture */}
			<Card>
				<CardHeader>
					<CardTitle>Profile Picture</CardTitle>
					<CardDescription>Upload and manage your profile picture</CardDescription>
				</CardHeader>
				<CardContent>
					<ImageUpload
						value={profile.image || ""}
						onChange={handleImageUpload}
						showReuse={true}
						imgHeight={150}
						imgWidth={150}
					/>
				</CardContent>
			</Card>

			{/* Personal Information */}
			<Card>
				<CardHeader>
					<CardTitle>Personal Information</CardTitle>
					<CardDescription>Update your profile details</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<Label htmlFor="email">Email Address</Label>
								<Input id="email" type="email" value={profile.email} disabled className="mt-2 bg-muted cursor-not-allowed" />
								<p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
							</div>
							<div>
								<Label htmlFor="role">Role</Label>
								<div className="mt-2">
									<div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
										<span className="text-muted-foreground">{getRoleLabel(profile?.role)}</span>
									</div>
								</div>
								<p className="text-xs text-muted-foreground mt-1">Contact admin to change role</p>
							</div>
						</div>

						<div>
							<Label htmlFor="name">Full Name</Label>
							<Input
								id="name"
								type="text"
								value={profile.name || ""}
								onChange={(e) => setProfile({ ...profile, name: e.target.value })}
								className="mt-2"
								placeholder="Enter your full name"
							/>
						</div>

						<div>
							<Label htmlFor="phone">Phone Number</Label>
							<Input
								id="phone"
								type="tel"
								value={profile.phone || ""}
								onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
								className="mt-2"
								placeholder="Enter your phone number"
							/>
						</div>

						<Button type="submit" disabled={saving} className="w-full">
							{saving ? "Saving..." : "Save Changes"}
						</Button>
					</form>
				</CardContent>
			</Card>

			{/* Account Information */}
			<Card>
				<CardHeader>
					<CardTitle>Account Information</CardTitle>
					<CardDescription>View your account details</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex justify-between items-center py-2 border-b">
						<span className="text-sm text-muted-foreground">Member Since</span>
						<span className="font-medium">{new Date(profile.createdAt).toLocaleDateString()}</span>
					</div>
					<div className="flex justify-between items-center py-2">
						<span className="text-sm text-muted-foreground">Account Status</span>
						<span className="font-medium text-green-600">Active</span>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
