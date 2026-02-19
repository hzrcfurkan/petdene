"use client"
import type React from "react"

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Plus, Trash2, Users, Edit } from "lucide-react"
import { useState } from "react"
import { UserListSkeleton } from "@/components/skeletons"
import { useStaff, useUserMutations } from "@/lib/react-query"

interface Staff {
	id: string
	name: string
	email: string
	role: string
	phone: string
	createdAt: string
}

interface StaffManagementProps {
	onStaffAdded?: () => void
}

export function StaffManagement({ onStaffAdded }: StaffManagementProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [isEditOpen, setIsEditOpen] = useState(false)
	const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [page, setPage] = useState(1)
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		password: "",
	})
	const [editFormData, setEditFormData] = useState({
		name: "",
		email: "",
		phone: "",
		password: "",
	})

	const { data: response, refetch, isLoading } = useStaff({ page, limit: 10 })

	const staff = response?.users || []
	const pagination = response?.pagination
	const { createStaff, updateUser, deleteUser } = useUserMutations()

	const handleAddStaff = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)

		try {
			await createStaff(formData)
			toast.success("Staff member added successfully")
			setIsOpen(false)
			setFormData({ name: "", email: "", phone: "", password: "" })
			refetch()
			onStaffAdded?.()
		} catch (error: any) {
			toast.error(error?.info?.error || "Failed to add staff member")
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleEditStaff = (staff: Staff) => {
		setEditingStaff(staff)
		setEditFormData({
			name: staff.name || "",
			email: staff.email || "",
			phone: staff.phone || "",
			password: "",
		})
		setIsEditOpen(true)
	}

	const handleUpdateStaff = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!editingStaff) return

		setIsSubmitting(true)

		try {
			const updateData: any = {
				name: editFormData.name,
				email: editFormData.email,
				phone: editFormData.phone,
			}

			// Only include password if it's provided
			if (editFormData.password) {
				updateData.password = editFormData.password
			}

			await updateUser(editingStaff.id, updateData)
			toast.success("Staff member updated successfully")
			setIsEditOpen(false)
			setEditingStaff(null)
			setEditFormData({ name: "", email: "", phone: "", password: "" })
			refetch()
		} catch (error: any) {
			console.error("Update staff error:", error)
			toast.error(error?.info?.error || error?.message || "Failed to update staff member")
		} finally {
			setIsSubmitting(false)
		}
	}

	async function handleRemoveStaff(userId: string) {
		try {
			await deleteUser(userId)
			toast.success("Staff member removed successfully")
			refetch()
		} catch (error: any) {
			toast.error(error?.info?.error || "Failed to remove staff member")
		}
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Users className="w-5 h-5" />
							Staff Management
						</CardTitle>
						<CardDescription>Manage your spa staff members</CardDescription>
					</div>
					<Dialog open={isOpen} onOpenChange={setIsOpen}>
						<DialogTrigger asChild>
							<Button size="sm" className="gap-2">
								<Plus className="w-4 h-4" />
								Add Staff
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Add New Staff Member</DialogTitle>
								<DialogDescription>Create a new staff account for your spa</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleAddStaff} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="name">Full Name</Label>
									<Input
										id="name"
										placeholder="John Doe"
										value={formData.name}
										onChange={(e) => setFormData({ ...formData, name: e.target.value })}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
										placeholder="john@example.com"
										value={formData.email}
										onChange={(e) => setFormData({ ...formData, email: e.target.value })}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="phone">Phone Number</Label>
									<Input
										id="phone"
										placeholder="+1 (555) 000-0000"
										value={formData.phone}
										onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="password">Password</Label>
									<Input
										id="password"
										type="password"
										placeholder="••••••••"
										value={formData.password}
										onChange={(e) => setFormData({ ...formData, password: e.target.value })}
										required
									/>
								</div>
								<Button type="submit" className="w-full" disabled={isSubmitting}>
									{isSubmitting ? "Adding..." : "Add Staff Member"}
								</Button>
							</form>
						</DialogContent>
					</Dialog>
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<UserListSkeleton count={3} />
				) : staff.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">No staff members yet</div>
				) : (
					<>
						<div className="space-y-4">
							{staff.map((member) => (
								<div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
									<div>
										<p className="font-semibold">{member.name}</p>
										<p className="text-sm text-muted-foreground">{member.email}</p>
										<p className="text-sm text-muted-foreground">{member.phone}</p>
									</div>
									<div className="flex items-center gap-2">
										<Badge>{member.role}</Badge>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleEditStaff(member)}
											className="text-primary hover:text-primary"
										>
											<Edit className="w-4 h-4" />
										</Button>
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
													<Trash2 className="w-4 h-4" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
												<AlertDialogDescription>
													Are you sure you want to delete {member.name}? This action cannot be undone.
												</AlertDialogDescription>
												<div className="flex gap-2 justify-end">
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction
														onClick={() => handleRemoveStaff(member.id)}
														className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
													>
														Delete
													</AlertDialogAction>
												</div>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</div>
							))}
						</div>
						{pagination && pagination.pages > 1 && (
							<div className="flex items-center justify-between mt-6 pt-4 border-t">
								<p className="text-sm text-muted-foreground">
									Page {pagination.page} of {pagination.pages} ({pagination.total} total)
								</p>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setPage(Math.max(1, page - 1))}
										disabled={page === 1}
									>
										Previous
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setPage(Math.min(pagination.pages, page + 1))}
										disabled={page === pagination.pages}
									>
										Next
									</Button>
								</div>
							</div>
						)}
					</>
				)}
			</CardContent>
			<Dialog
				open={isEditOpen}
				onOpenChange={(open) => {
					setIsEditOpen(open)
					if (!open) {
						setEditingStaff(null)
						setEditFormData({ name: "", email: "", phone: "", password: "" })
					}
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Staff Member</DialogTitle>
						<DialogDescription>Update staff member information</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleUpdateStaff} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="edit-name">Full Name</Label>
							<Input
								id="edit-name"
								placeholder="John Doe"
								value={editFormData.name}
								onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="edit-email">Email</Label>
							<Input
								id="edit-email"
								type="email"
								placeholder="john@example.com"
								value={editFormData.email}
								onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="edit-phone">Phone Number</Label>
							<Input
								id="edit-phone"
								placeholder="+1 (555) 000-0000"
								value={editFormData.phone}
								onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="edit-password">New Password (leave blank to keep current)</Label>
							<Input
								id="edit-password"
								type="password"
								placeholder="••••••••"
								value={editFormData.password}
								onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
							/>
						</div>
						<Button type="submit" className="w-full" disabled={isSubmitting}>
							{isSubmitting ? "Updating..." : "Update Staff Member"}
						</Button>
					</form>
				</DialogContent>
			</Dialog>
		</Card>
	)
}
