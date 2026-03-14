"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getRoleLabel, currentUserClient } from "@/lib/auth/client"
import { Search, Shield, Plus, Edit, Trash2 } from "lucide-react"
import { useState } from "react"
import { useUsers, useUserMutations } from "@/lib/react-query"
import { toast } from "sonner"
import { UserListSkeleton } from "@/components/skeletons"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface User {
	id: string
	name: string
	email: string
	role: string
	phone: string
	createdAt: string
}

interface UsersResponse {
	users: User[]
	pagination: {
		total: number
		page: number
		limit: number
		pages: number
	}
}

export function UserManagement() {
	const [page, setPage] = useState(1)
	const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "date-asc" | "date-desc">("date-desc")
	const [roleFilter, setRoleFilter] = useState<string>("ALL")
	const [searchQuery, setSearchQuery] = useState("")

	const { data, refetch, isLoading } = useUsers({
		page,
		limit: 10,
		sort: sortBy,
		role: roleFilter === "ALL" ? undefined : roleFilter,
		search: searchQuery,
	})
	const users = data?.users || []
	const pagination = data?.pagination

	const currentUser = currentUserClient()
	const [updatingId, setUpdatingId] = useState<string | null>(null)
	const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
	const [editingUser, setEditingUser] = useState<User | null>(null)
	const [customerForm, setCustomerForm] = useState({ name: "", email: "", phone: "", password: "" })
	const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", password: "" })
	const { updateUserRole, updateUser, deleteUser, createCustomer } = useUserMutations()

	if (!currentUser) return null

	const currentUserId = currentUser.id
	const currentUserRole = currentUser.role

	const handleRoleChange = async (userId: string, newRole: string) => {
		if (currentUserRole !== "SUPER_ADMIN") {
			toast.error("Yalnızca Süper Admin rolleri yönetebilir")
			return
		}

		if (userId === currentUserId) {
			toast.error("Kendi rolünüzü değiştiremezsiniz")
			return
		}

		setUpdatingId(userId)
		try {
			await updateUserRole(userId, newRole)
			toast.success("Kullanıcı rolü başarıyla güncellendi")
			refetch()
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Kullanıcı rolü güncellenemedi")
		} finally {
			setUpdatingId(null)
		}
	}

	const handleReset = () => {
		setPage(1)
		setSortBy("date-desc")
		setRoleFilter("ALL")
		setSearchQuery("")
	}

	const handleAddCustomer = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			await createCustomer({
				name: customerForm.name,
				email: customerForm.email,
				phone: customerForm.phone || undefined,
				password: customerForm.password || undefined,
			})
			toast.success("Müşteri başarıyla eklendi")
			setIsAddCustomerOpen(false)
			setCustomerForm({ name: "", email: "", phone: "", password: "" })
			refetch()
		} catch (error: any) {
			toast.error(error?.info?.error || "Müşteri eklenemedi")
		}
	}

	const handleEditCustomer = (user: User) => {
		setEditingUser(user)
		setEditForm({
			name: user.name || "",
			email: user.email,
			phone: user.phone || "",
			password: "",
		})
	}

	const handleUpdateCustomer = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!editingUser) return
		try {
			await updateUser(editingUser.id, {
				name: editForm.name,
				email: editForm.email,
				phone: editForm.phone || undefined,
				password: editForm.password || undefined,
			})
			toast.success("Müşteri başarıyla güncellendi")
			setEditingUser(null)
			refetch()
		} catch (error: any) {
			toast.error(error?.info?.error || "Müşteri güncellenemedi")
		}
	}

	const handleDeleteCustomer = async (userId: string, userName: string) => {
		try {
			await deleteUser(userId)
			toast.success("Müşteri kaldırıldı")
			refetch()
		} catch (error: any) {
			toast.error(error?.info?.error || "Müşteri kaldırılamadı")
		}
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Shield className="w-5 h-5" />
							User Management
						</CardTitle>
						<CardDescription>Manage users, roles, and permissions</CardDescription>
					</div>
					{(roleFilter === "CUSTOMER" || roleFilter === "ALL") && (
						<Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
							<DialogTrigger asChild>
								<Button size="sm" className="gap-2">
									<Plus className="w-4 h-4" />
									Add Customer
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Yeni Müşteri Ekle</DialogTitle>
									<DialogDescription>Yeni müşteri hesabı oluşturun. Şifre opsiyoneldir - sıfırlama bağlantısı gönderilebilir.</DialogDescription>
								</DialogHeader>
								<form onSubmit={handleAddCustomer} className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="cust-name">Name *</Label>
										<Input
											id="cust-name"
											placeholder="Ad Soyad"
											value={customerForm.name}
											onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="cust-email">Email *</Label>
										<Input
											id="cust-email"
											type="email"
											placeholder="ornek@eposta.com"
											value={customerForm.email}
											onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="cust-phone">Telefon</Label>
										<Input
											id="cust-phone"
											placeholder="+90 555 123 4567"
											value={customerForm.phone}
											onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="cust-password">Şifre (opsiyonel - sıfırlama bağlantısı göndermek için boş bırakın)</Label>
										<Input
											id="cust-password"
											type="password"
											placeholder="••••••••"
											value={customerForm.password}
											onChange={(e) => setCustomerForm({ ...customerForm, password: e.target.value })}
										/>
									</div>
									<Button type="submit" className="w-full" disabled={!customerForm.name || !customerForm.email}>
										Add Customer
									</Button>
								</form>
							</DialogContent>
						</Dialog>
					)}
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex gap-2 flex-wrap">
					<div className="flex-1 min-w-[200px]">
						<div className="relative">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Ad veya e-posta ile ara..."
								value={searchQuery}
								onChange={(e) => {
									setSearchQuery(e.target.value)
									setPage(1)
								}}
								className="pl-8"
							/>
						</div>
					</div>
					<Select
						value={sortBy}
						onValueChange={(value: any) => {
							setSortBy(value)
							setPage(1)
						}}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Sırala..." />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="name-asc">Ad (A-Z)</SelectItem>
							<SelectItem value="name-desc">Ad (Z-A)</SelectItem>
							<SelectItem value="date-desc">En Yeni</SelectItem>
							<SelectItem value="date-asc">En Eski</SelectItem>
						</SelectContent>
					</Select>
					<Select
						value={roleFilter}
						onValueChange={(value) => {
							setRoleFilter(value)
							setPage(1)
						}}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Role göre filtrele..." />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">Tüm Roller</SelectItem>
							<SelectItem value="CUSTOMER">Müşteri</SelectItem>
							<SelectItem value="DOCTOR">Doktor</SelectItem>
							<SelectItem value="NURSE">Hemşire</SelectItem>
							<SelectItem value="ADMIN">Admin</SelectItem>
							<SelectItem value="SUPER_ADMIN">Süper Admin</SelectItem>
						</SelectContent>
					</Select>
					<Button variant="outline" onClick={handleReset}>
						Reset
					</Button>
				</div>

				{isLoading ? (
					<UserListSkeleton count={5} />
				) : (
					<div className="space-y-4">
						{users.map((user) => (
							<div
								key={user.id}
								className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
							>
								<div className="flex-1">
									<p className="font-semibold">{user.name}</p>
									<p className="text-sm text-muted-foreground">{user.email}</p>
									{user.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
								</div>
								<div className="flex items-center gap-2">
									<Select
										value={user.role}
										onValueChange={(value) => handleRoleChange(user.id, value)}
										disabled={updatingId === user.id || currentUserRole !== "SUPER_ADMIN" || user.id === currentUserId}
									>
										<SelectTrigger className="w-40">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="CUSTOMER">{getRoleLabel("CUSTOMER")}</SelectItem>
											<SelectItem value="DOCTOR">{getRoleLabel("DOCTOR")}</SelectItem>
											<SelectItem value="NURSE">{getRoleLabel("NURSE")}</SelectItem>
											<SelectItem value="ADMIN">{getRoleLabel("ADMIN")}</SelectItem>
											<SelectItem value="SUPER_ADMIN">{getRoleLabel("SUPER_ADMIN")}</SelectItem>
										</SelectContent>
									</Select>
									{user.role === "CUSTOMER" && user.id !== currentUserId && (
										<>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleEditCustomer(user)}
												className="text-primary"
											>
												<Edit className="w-4 h-4" />
											</Button>
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button variant="ghost" size="sm" className="text-destructive">
														<Trash2 className="w-4 h-4" />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogTitle>Delete Customer</AlertDialogTitle>
													<AlertDialogDescription>
														Are you sure you want to remove {user.name || user.email}? This will soft-delete the account. They will no longer be able to sign in.
													</AlertDialogDescription>
													<div className="flex gap-2 justify-end">
														<AlertDialogCancel>İptal</AlertDialogCancel>
														<AlertDialogAction
															onClick={() => handleDeleteCustomer(user.id, user.name || user.email)}
															className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
														>
															Delete
														</AlertDialogAction>
													</div>
												</AlertDialogContent>
											</AlertDialog>
										</>
									)}
									{user.id === currentUserId && <span className="text-xs text-muted-foreground">(You)</span>}
								</div>
							</div>
						))}
					</div>
				)}

				{pagination && pagination.pages > 1 && (
					<div className="flex items-center justify-between pt-4 border-t">
						<p className="text-sm text-muted-foreground">
							Page {pagination.page} of {pagination.pages} ({pagination.total} total)
						</p>
						<div className="flex gap-2">
							<Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
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
			</CardContent>

			{/* Edit Customer Dialog */}
			<Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Müşteri Düzenle</DialogTitle>
						<DialogDescription>Müşteri bilgilerini güncelle</DialogDescription>
					</DialogHeader>
					{editingUser && (
						<form onSubmit={handleUpdateCustomer} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="edit-name">Name *</Label>
								<Input
									id="edit-name"
									value={editForm.name}
									onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="edit-email">Email *</Label>
								<Input
									id="edit-email"
									type="email"
									value={editForm.email}
									onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="edit-phone">Telefon</Label>
								<Input
									id="edit-phone"
									value={editForm.phone}
									onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="edit-password">New Password (leave blank to keep current)</Label>
								<Input
									id="edit-password"
									type="password"
									placeholder="••••••••"
									value={editForm.password}
									onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
								/>
							</div>
							<Button type="submit" className="w-full">Update Customer</Button>
						</form>
					)}
				</DialogContent>
			</Dialog>
		</Card>
	)
}
