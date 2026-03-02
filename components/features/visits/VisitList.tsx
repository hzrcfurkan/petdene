"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, FileText, Calendar } from "lucide-react"
import { useState } from "react"
import { useVisits } from "@/lib/react-query/hooks/visits"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ResponsiveTableWrapper } from "@/components/ui/responsive-table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCurrency } from "@/components/providers/CurrencyProvider"
import { VisitForm } from "./VisitForm"
import { currentUserClient } from "@/lib/auth/client"

interface VisitListProps {
	petId?: string
	showCreate?: boolean
}

export function VisitList({ petId, showCreate = true }: VisitListProps) {
	const { formatCurrency } = useCurrency()
	const [page, setPage] = useState(1)
	const [isFormOpen, setIsFormOpen] = useState(false)
	const [dateFrom, setDateFrom] = useState("")
	const [dateTo, setDateTo] = useState("")

	const currentUser = currentUserClient()
	const pathname = usePathname()
	const detailBasePath = pathname?.startsWith("/admin")
		? "/admin/visits"
		: pathname?.startsWith("/customer")
			? "/customer/visits"
			: undefined

	const { data, refetch, isLoading } = useVisits({
		page,
		limit: 10,
		sort: "date-desc",
		petId,
		dateFrom: dateFrom || undefined,
		dateTo: dateTo || undefined,
	})

	const visits = data?.visits || []
	const pagination = data?.pagination
	const canCreate = currentUser && (currentUser.isStaff || currentUser.isAdmin || currentUser.isSuperAdmin)

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "Tamamlandı":
				return <Badge variant="default">Tamamlandı</Badge>
			case "İptal Edildi":
				return <Badge variant="destructive">İptal Edildi</Badge>
			default:
				return <Badge variant="secondary">In Progress</Badge>
		}
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">Visits (Protocols)</CardTitle>
						<CardDescription>
							Clinic visits - central transaction unit for medical records, services & payments
						</CardDescription>
					</div>
					{showCreate && canCreate && (
						<Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
							<DialogTrigger asChild>
								<Button>
									<Plus className="w-4 h-4 mr-2" />
									New Visit
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-lg">
								<DialogHeader>
									<DialogTitle>Create New Visit</DialogTitle>
									<DialogDescription>
										Register a patient visit. Protocol number will be auto-generated.
									</DialogDescription>
								</DialogHeader>
								<VisitForm
									onSuccess={() => {
										setIsFormOpen(false)
										refetch()
									}}
									onCancel={() => setIsFormOpen(false)}
									defaultPetId={petId}
								/>
							</DialogContent>
						</Dialog>
					)}
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Date Range Filter */}
				{detailBasePath && (
					<div className="flex flex-wrap items-end gap-4 rounded-lg border p-4">
						<div className="flex items-center gap-2">
							<Calendar className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm font-medium">Filter by Date</span>
						</div>
						<div className="flex flex-wrap items-end gap-4">
							<div className="space-y-2">
								<Label htmlFor="dateFrom" className="text-xs">Start Date</Label>
								<Input
									id="dateFrom"
									type="date"
									value={dateFrom}
									onChange={(e) => {
										setDateFrom(e.target.value)
										setPage(1)
									}}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="dateTo" className="text-xs">End Date</Label>
								<Input
									id="dateTo"
									type="date"
									value={dateTo}
									onChange={(e) => {
										setDateTo(e.target.value)
										setPage(1)
									}}
								/>
							</div>
							{(dateFrom || dateTo) && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										setDateFrom("")
										setDateTo("")
										setPage(1)
									}}
								>
									Clear
								</Button>
							)}
						</div>
					</div>
				)}
				{isLoading ? (
					<div className="text-center py-8">Loading visits...</div>
				) : visits.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">No visits found</div>
				) : (
					<>
						<ResponsiveTableWrapper>
							<Table className="min-w-[640px]">
								<TableHeader>
									<TableRow>
										<TableHead>Protocol #</TableHead>
										<TableHead>Hasta</TableHead>
										<TableHead>Tarih</TableHead>
										<TableHead>Toplam</TableHead>
										<TableHead>Ödenen</TableHead>
										<TableHead>Bakiye</TableHead>
										<TableHead>Durum</TableHead>
										{detailBasePath && <TableHead className="text-right">İşlemler</TableHead>}
									</TableRow>
								</TableHeader>
								<TableBody>
									{visits.map((visit: any) => {
										const balance = visit.totalAmount - visit.paidAmount
										return (
											<TableRow key={visit.id}>
												<TableCell>
													<Badge variant="outline">PRO-{visit.protocolNumber}</Badge>
												</TableCell>
												<TableCell>
													<div>
														<div className="font-medium">{visit.pet?.name}</div>
														<div className="text-xs text-muted-foreground">
															{visit.pet?.patientNumber} • {visit.pet?.species}
														</div>
													</div>
												</TableCell>
												<TableCell>
													{format(new Date(visit.visitDate), "MMM dd, yyyy HH:mm")}
												</TableCell>
												<TableCell>{formatCurrency(visit.totalAmount)}</TableCell>
												<TableCell>{formatCurrency(visit.paidAmount)}</TableCell>
												<TableCell>
													<span className={balance > 0 ? "text-destructive font-medium" : ""}>
														{formatCurrency(balance)}
													</span>
												</TableCell>
												<TableCell>{getStatusBadge(visit.status)}</TableCell>
												{detailBasePath && (
													<TableCell className="text-right">
														<Button variant="ghost" size="sm" asChild>
															<Link href={`${detailBasePath}/${visit.id}`}>
																<Eye className="w-4 h-4" />
															</Link>
														</Button>
													</TableCell>
												)}
											</TableRow>
										)
									})}
								</TableBody>
							</Table>
						</ResponsiveTableWrapper>

						{pagination && pagination.pages > 1 && (
							<div className="flex justify-between items-center mt-4">
								<div className="text-sm text-muted-foreground">
									Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, pagination.total)} of {pagination.total}
								</div>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setPage((p) => Math.max(1, p - 1))}
										disabled={page === 1}
									>
										Previous
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setPage((p) => p + 1)}
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
		</Card>
	)
}
