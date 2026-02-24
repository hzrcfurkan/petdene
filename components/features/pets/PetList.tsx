"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Plus, Eye, Edit, Trash2, PawPrint } from "lucide-react"
import { useState } from "react"
import { usePets, useDeletePet, type Pet } from "@/lib/react-query/hooks/pets"
import { toast } from "sonner"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PetForm } from "./PetForm"
import { PetDetail } from "./PetDetail"
import { currentUserClient } from "@/lib/auth/client"

interface PetListProps {
	ownerId?: string
	species?: string
	showActions?: boolean
}

export function PetList({ ownerId, species, showActions = true }: PetListProps) {
	const [page, setPage] = useState(1)
	const [sortBy, setSortBy] = useState<string>("date-desc")
	const [speciesFilter, setSpeciesFilter] = useState<string>(species || "ALL")
	const [searchQuery, setSearchQuery] = useState("")
	const [editingPet, setEditingPet] = useState<Pet | null>(null)
	const [viewingPet, setViewingPet] = useState<Pet | null>(null)
	const [isFormOpen, setIsFormOpen] = useState(false)

	const currentUser = currentUserClient()

	const { data, refetch, isLoading } = usePets({
		page,
		limit: 10,
		sort: sortBy,
		ownerId,
		species: speciesFilter === "ALL" ? undefined : speciesFilter,
		search: searchQuery || undefined,
	})

	const pets = data?.pets || []
	const pagination = data?.pagination
	const { mutate: deletePet } = useDeletePet()

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this pet? This will also delete all related records.")) return

		try {
			await deletePet(id)
			toast.success("Pet deleted successfully")
			refetch()
		} catch (error: any) {
			toast.error(error?.info?.error || "Failed to delete pet")
		}
	}

	const handleEdit = (pet: Pet) => {
		setEditingPet(pet)
		setIsFormOpen(true)
	}

	const handleView = (pet: Pet) => {
		setViewingPet(pet)
	}

	const handleFormSuccess = () => {
		setIsFormOpen(false)
		setEditingPet(null)
		refetch()
	}

	const canEdit = currentUser && (currentUser.isAdmin || currentUser.isSuperAdmin || currentUser.isStaff || currentUser.role === "CUSTOMER")
	const canDelete = currentUser && (currentUser.isAdmin || currentUser.isSuperAdmin || currentUser.isStaff)

	const speciesOptions = ["Dog", "Cat", "Bird", "Rabbit", "Hamster", "Fish", "Other"]

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<PawPrint className="w-5 h-5" />
							Pets
						</CardTitle>
						<CardDescription>Manage and view pets</CardDescription>
					</div>
					{showActions && canEdit && (
						<Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
							<DialogTrigger asChild>
								<Button onClick={() => setEditingPet(null)}>
									<Plus className="w-4 h-4 mr-2" />
									New Pet
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
								<DialogHeader>
									<DialogTitle>{editingPet ? "Edit Pet" : "Add New Pet"}</DialogTitle>
									<DialogDescription>
										{editingPet ? "Update pet information" : "Add a new pet to the system"}
									</DialogDescription>
								</DialogHeader>
								<PetForm
									pet={editingPet}
									onSuccess={handleFormSuccess}
									onCancel={() => {
										setIsFormOpen(false)
										setEditingPet(null)
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
								placeholder="Search by name, breed, species..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-8"
							/>
						</div>
					</div>
					<Select value={speciesFilter} onValueChange={setSpeciesFilter} disabled={!!species}>
						<SelectTrigger className="w-[180px]">
							<Filter className="w-4 h-4 mr-2" />
							<SelectValue placeholder="Species" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">All Species</SelectItem>
							{speciesOptions.map((spec) => (
								<SelectItem key={spec} value={spec}>
									{spec}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select value={sortBy} onValueChange={setSortBy}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="name-asc">Name (A-Z)</SelectItem>
							<SelectItem value="name-desc">Name (Z-A)</SelectItem>
							<SelectItem value="date-asc">Date (Oldest)</SelectItem>
							<SelectItem value="date-desc">Date (Newest)</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{(speciesFilter !== "ALL" || searchQuery) && !species && (
					<Button variant="outline" onClick={() => {
						setSpeciesFilter("ALL")
						setSearchQuery("")
					}}>
						Clear Filters
					</Button>
				)}

				{/* Table */}
				{isLoading ? (
					<div className="text-center py-8">Loading pets...</div>
				) : pets.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">No pets found</div>
				) : (
					<>
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Species</TableHead>
										<TableHead>Breed</TableHead>
										<TableHead>Age</TableHead>
										<TableHead>Owner</TableHead>
										<TableHead>Records</TableHead>
										{showActions && <TableHead className="text-right">Actions</TableHead>}
									</TableRow>
								</TableHeader>
								<TableBody>
									{pets.map((pet) => (
										<TableRow key={pet.id}>
											<TableCell>
												<div className="flex items-center gap-2">
													{pet.image && (
														<img
															src={pet.image}
															alt={pet.name}
															className="w-10 h-10 rounded-full object-cover"
														/>
													)}
													<div>
														<div className="font-medium">{pet.name}</div>
														{pet.gender && (
															<div className="text-sm text-muted-foreground">{pet.gender}</div>
														)}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<Badge variant="outline">{pet.species}</Badge>
											</TableCell>
											<TableCell>{pet.breed || "N/A"}</TableCell>
											<TableCell>
												{pet.age ? `${pet.age} years` : pet.dateOfBirth ? format(new Date(pet.dateOfBirth), "MMM yyyy") : "N/A"}
											</TableCell>
											<TableCell>
												{pet.owner?.name || pet.owner?.email || "N/A"}
											</TableCell>
											<TableCell>
												<div className="text-sm">
													{pet._count?.appointments || 0} appointments,{" "}
													{pet._count?.vaccinations || 0} vaccinations
												</div>
											</TableCell>
											{showActions && (
												<TableCell className="text-right">
													<div className="flex justify-end gap-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleView(pet)}
														>
															<Eye className="w-4 h-4" />
														</Button>
														{canEdit && (
															<Button
																variant="ghost"
																size="sm"
																onClick={() => handleEdit(pet)}
															>
																<Edit className="w-4 h-4" />
															</Button>
														)}
														{canDelete && (
															<Button
																variant="ghost"
																size="sm"
																onClick={() => handleDelete(pet.id)}
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
									Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, pagination.total)} of {pagination.total} pets
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
			{viewingPet && (
				<Dialog open={!!viewingPet} onOpenChange={() => setViewingPet(null)}>
					<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
						<PetDetail pet={viewingPet} />
					</DialogContent>
				</Dialog>
			)}
		</Card>
	)
}

