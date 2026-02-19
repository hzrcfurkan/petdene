"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Search, Filter, Plus, Eye, Edit, Trash2, Sparkles } from "lucide-react"
import { useState } from "react"
import { usePetServices, useDeletePetService, useUpdatePetService, type PetService } from "@/lib/react-query/hooks/pet-services"
import { toast } from "sonner"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PetServiceForm } from "./PetServiceForm"
import { PetServiceDetail } from "./PetServiceDetail"
import { currentUserClient } from "@/lib/auth/client"

interface PetServiceListProps {
	type?: string
	active?: boolean
	showActions?: boolean
}

const serviceTypes = ["grooming", "vet-checkup", "bath", "boarding", "training"]

export function PetServiceList({ type, active, showActions = true }: PetServiceListProps) {
	const [page, setPage] = useState(1)
	const [sortBy, setSortBy] = useState<string>("date-desc")
	const [typeFilter, setTypeFilter] = useState<string>(type || "ALL")
	const [activeFilter, setActiveFilter] = useState<string>(active !== undefined ? active.toString() : "ALL")
	const [searchQuery, setSearchQuery] = useState("")
	const [editingService, setEditingService] = useState<PetService | null>(null)
	const [viewingService, setViewingService] = useState<PetService | null>(null)
	const [isFormOpen, setIsFormOpen] = useState(false)

	const currentUser = currentUserClient()

	const { data, refetch, isLoading } = usePetServices({
		page,
		limit: 10,
		sort: sortBy,
		type: typeFilter === "ALL" ? undefined : typeFilter,
		active: activeFilter === "ALL" ? undefined : activeFilter === "true",
		search: searchQuery || undefined,
	})

	const services = data?.services || []
	const pagination = data?.pagination
	const { mutate: deleteService } = useDeletePetService()
	const { mutate: updateService } = useUpdatePetService()

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this service? This will also affect related appointments.")) return

		try {
			await deleteService(id)
			toast.success("Service deleted successfully")
			refetch()
		} catch (error: any) {
			toast.error(error?.info?.error || "Failed to delete service")
		}
	}

	const handleToggleActive = async (service: PetService) => {
		try {
			await updateService({
				id: service.id,
				data: { active: !service.active },
			})
			toast.success(`Service ${!service.active ? "activated" : "deactivated"} successfully`)
			refetch()
		} catch (error: any) {
			toast.error(error?.info?.error || "Failed to update service")
		}
	}

	const handleEdit = (service: PetService) => {
		setEditingService(service)
		setIsFormOpen(true)
	}

	const handleView = (service: PetService) => {
		setViewingService(service)
	}

	const handleFormSuccess = () => {
		setIsFormOpen(false)
		setEditingService(null)
		refetch()
	}

	const canEdit = currentUser && (currentUser.isAdmin || currentUser.isSuperAdmin)
	const canDelete = currentUser && (currentUser.isAdmin || currentUser.isSuperAdmin)

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Sparkles className="w-5 h-5" />
							Pet Services
						</CardTitle>
						<CardDescription>Manage and view pet services catalog</CardDescription>
					</div>
					{showActions && canEdit && (
						<Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
							<DialogTrigger asChild>
								<Button onClick={() => setEditingService(null)}>
									<Plus className="w-4 h-4 mr-2" />
									New Service
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
								<DialogHeader>
									<DialogTitle>{editingService ? "Edit Service" : "Create Service"}</DialogTitle>
									<DialogDescription>
										{editingService ? "Update service information" : "Add a new service to the catalog"}
									</DialogDescription>
								</DialogHeader>
								<PetServiceForm
									service={editingService}
									onSuccess={handleFormSuccess}
									onCancel={() => {
										setIsFormOpen(false)
										setEditingService(null)
									}}
								/>
							</DialogContent>
						</Dialog>
					)}
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Filters */}
				<div className="flex gap-2 flex-wrap">
					<div className="flex-1 min-w-[200px]">
						<div className="relative">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search by title, description, type..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-8"
							/>
						</div>
					</div>
					<Select value={typeFilter} onValueChange={setTypeFilter} disabled={!!type}>
						<SelectTrigger className="w-[180px]">
							<Filter className="w-4 h-4 mr-2" />
							<SelectValue placeholder="Type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">All Types</SelectItem>
							{serviceTypes.map((t) => (
								<SelectItem key={t} value={t}>
									{t.charAt(0).toUpperCase() + t.slice(1).replace("-", " ")}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select value={activeFilter} onValueChange={setActiveFilter} disabled={active !== undefined}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">All Status</SelectItem>
							<SelectItem value="true">Active</SelectItem>
							<SelectItem value="false">Inactive</SelectItem>
						</SelectContent>
					</Select>
					<Select value={sortBy} onValueChange={setSortBy}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="title-asc">Title (A-Z)</SelectItem>
							<SelectItem value="title-desc">Title (Z-A)</SelectItem>
							<SelectItem value="price-asc">Price (Low-High)</SelectItem>
							<SelectItem value="price-desc">Price (High-Low)</SelectItem>
							<SelectItem value="date-asc">Date (Oldest)</SelectItem>
							<SelectItem value="date-desc">Date (Newest)</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{(typeFilter !== "ALL" || activeFilter !== "ALL" || searchQuery) && !type && active === undefined && (
					<Button variant="outline" onClick={() => {
						setTypeFilter("ALL")
						setActiveFilter("ALL")
						setSearchQuery("")
					}}>
						Clear Filters
					</Button>
				)}

				{/* Table */}
				{isLoading ? (
					<div className="text-center py-8">Loading services...</div>
				) : services.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">No services found</div>
				) : (
					<>
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Title</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Price</TableHead>
										<TableHead>Duration</TableHead>
										<TableHead>Appointments</TableHead>
										<TableHead>Status</TableHead>
										{showActions && <TableHead className="text-right">Actions</TableHead>}
									</TableRow>
								</TableHeader>
								<TableBody>
									{services.map((service) => (
										<TableRow key={service.id}>
											<TableCell>
												<div className="flex items-center gap-2">
													{service.image && (
														<img
															src={service.image}
															alt={service.title}
															className="w-10 h-10 rounded object-cover"
														/>
													)}
													<div>
														<div className="font-medium">{service.title}</div>
														{service.description && (
															<div className="text-sm text-muted-foreground line-clamp-1">
																{service.description}
															</div>
														)}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<Badge variant="outline">
													{service.type.charAt(0).toUpperCase() + service.type.slice(1).replace("-", " ")}
												</Badge>
											</TableCell>
											<TableCell>
												<div className="font-medium">${service.price.toFixed(2)}</div>
											</TableCell>
											<TableCell>
												{service.duration ? `${service.duration} min` : "N/A"}
											</TableCell>
											<TableCell>
												{service._count?.appointments || 0}
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<Badge className={service.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
														{service.active ? "Active" : "Inactive"}
													</Badge>
													{canEdit && (
														<Switch
															checked={service.active}
															onCheckedChange={() => handleToggleActive(service)}
															aria-label="Toggle active status"
														/>
													)}
												</div>
											</TableCell>
											{showActions && (
												<TableCell className="text-right">
													<div className="flex justify-end gap-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleView(service)}
														>
															<Eye className="w-4 h-4" />
														</Button>
														{canEdit && (
															<Button
																variant="ghost"
																size="sm"
																onClick={() => handleEdit(service)}
															>
																<Edit className="w-4 h-4" />
															</Button>
														)}
														{canDelete && (
															<Button
																variant="ghost"
																size="sm"
																onClick={() => handleDelete(service.id)}
															>
																<Trash2 className="w-4 h-4" />
															</Button>
														)}
													</div>
												</TableCell>
											)}
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>

						{/* Pagination */}
						{pagination && pagination.pages > 1 && (
							<div className="flex items-center justify-between">
								<div className="text-sm text-muted-foreground">
									Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, pagination.total)} of {pagination.total} services
								</div>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setPage(page - 1)}
										disabled={page === 1}
									>
										Previous
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setPage(page + 1)}
										disabled={page >= pagination.pages}
									>
										Next
									</Button>
								</div>
							</div>
						)}
					</>
				)}
			</CardContent>

			{/* View Detail Dialog */}
			{viewingService && (
				<Dialog open={!!viewingService} onOpenChange={() => setViewingService(null)}>
					<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
						<PetServiceDetail service={viewingService} />
					</DialogContent>
				</Dialog>
			)}
		</Card>
	)
}

