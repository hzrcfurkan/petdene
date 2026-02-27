"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CreditCard, DollarSign, User, Wallet, Calendar } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import Link from "next/link"
import { useUnpaidVisits } from "@/lib/react-query/hooks/payments"
import { useAddVisitPayment } from "@/lib/react-query/hooks/visits"
import { toast } from "sonner"
import { ResponsiveTableWrapper } from "@/components/ui/responsive-table"
import { useCurrency } from "@/components/providers/CurrencyProvider"

export function PaymentScreen() {
	const { formatCurrency } = useCurrency()
	const [dateFrom, setDateFrom] = useState("")
	const [dateTo, setDateTo] = useState("")
	const { data, isLoading, refetch } = useUnpaidVisits({
		dateFrom: dateFrom || undefined,
		dateTo: dateTo || undefined,
	})
	const [selectedVisit, setSelectedVisit] = useState<{
		id: string
		balance: number
		petName: string
		protocolNumber: number
	} | null>(null)
	const [paymentMethod, setPaymentMethod] = useState("cash")
	const [paymentAmount, setPaymentAmount] = useState("")
	const [paymentNotes, setPaymentNotes] = useState("")
	const [paymentType, setPaymentType] = useState<"partial" | "full" | "mark">("full")

	const addPayment = useAddVisitPayment(selectedVisit?.id || "")

	const unpaidVisits = data?.unpaidVisits || []
	const customerBalances = data?.customerBalances || []
	const totalOutstanding = data?.totalOutstanding ?? 0

	const handleOpenPayment = (visit: (typeof unpaidVisits)[0]) => {
		setSelectedVisit({
			id: visit.id,
			balance: visit.balance,
			petName: visit.pet.name,
			protocolNumber: visit.protocolNumber,
		})
		setPaymentAmount("")
		setPaymentNotes("")
		setPaymentType("full")
		setPaymentMethod("cash")
	}

	const handleRecordPayment = async () => {
		if (!selectedVisit) return

		let amount: number
		if (paymentType === "full" || paymentType === "mark") {
			amount = selectedVisit.balance
		} else {
			amount = Number(paymentAmount)
			if (!amount || amount <= 0) {
				toast.error("Enter valid amount")
				return
			}
			if (amount > selectedVisit.balance) {
				toast.error(`Amount exceeds balance (${formatCurrency(selectedVisit.balance)})`)
				return
			}
		}

		try {
			await addPayment.mutateAsync({
				method: paymentMethod,
				amount,
				notes: paymentNotes || undefined,
			})
			toast.success(
				paymentType === "partial"
					? `Partial payment of ${formatCurrency(amount)} recorded`
					: "Visit marked as paid"
			)
			setSelectedVisit(null)
			refetch()
		} catch (err: any) {
			toast.error(err?.info?.error || "Failed to record payment")
		}
	}

	const handleMarkAsPaid = async () => {
		if (!selectedVisit) return
		try {
			await addPayment.mutateAsync({
				method: paymentMethod,
				amount: selectedVisit.balance,
				notes: paymentNotes || undefined,
			})
			toast.success("Visit marked as paid")
			setSelectedVisit(null)
			refetch()
		} catch (err: any) {
			toast.error(err?.info?.error || "Failed to record payment")
		}
	}

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Card>
					<CardContent className="pt-6">
						<p className="text-muted-foreground">Loading payment data...</p>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* Date Range Filter */}
			<div className="flex flex-wrap items-end gap-4 rounded-lg border p-4">
				<div className="flex items-center gap-2">
					<Calendar className="h-4 w-4 text-muted-foreground" />
					<span className="text-sm font-medium">Filter by Visit Date</span>
				</div>
				<div className="flex flex-wrap items-end gap-4">
					<div className="space-y-2">
						<Label htmlFor="pay-dateFrom" className="text-xs">Start Date</Label>
						<Input
							id="pay-dateFrom"
							type="date"
							value={dateFrom}
							onChange={(e) => setDateFrom(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="pay-dateTo" className="text-xs">End Date</Label>
						<Input
							id="pay-dateTo"
							type="date"
							value={dateTo}
							onChange={(e) => setDateTo(e.target.value)}
						/>
					</div>
					{(dateFrom || dateTo) && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setDateFrom("")
								setDateTo("")
							}}
						>
							Clear
						</Button>
					)}
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
						<Wallet className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className={`text-2xl font-bold ${totalOutstanding > 0 ? "text-amber-600" : ""}`}>
							{formatCurrency(totalOutstanding)}
						</div>
						<p className="text-xs text-muted-foreground">
							{unpaidVisits.length} visit{unpaidVisits.length !== 1 ? "s" : ""} with balance
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Customers with Debt</CardTitle>
						<User className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{customerBalances.length}</div>
						<p className="text-xs text-muted-foreground">Accounts receivable</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
						<CreditCard className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							Record partial, full payment, or mark as paid for any visit below.
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Customer Balances */}
			{customerBalances.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Customer Balances</CardTitle>
						<CardDescription>Outstanding debt per customer (owner)</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{customerBalances.map((cb) => (
								<div
									key={cb.ownerId}
									className="flex items-center justify-between rounded-lg border p-3"
								>
									<div>
										<p className="font-medium">{cb.ownerName || cb.ownerEmail}</p>
										<p className="text-sm text-muted-foreground">
											{cb.visitCount} visit{cb.visitCount !== 1 ? "s" : ""} • {cb.ownerEmail}
										</p>
									</div>
									<p className="text-lg font-bold text-amber-600">
										{formatCurrency(cb.totalDebt)}
									</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Unpaid Visits */}
			<Card>
				<CardHeader>
					<CardTitle>Visits with Outstanding Balance</CardTitle>
					<CardDescription>
						Record partial payment, full payment, or mark as paid. Balance updates automatically.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{unpaidVisits.length === 0 ? (
						<p className="text-muted-foreground py-8 text-center">
							No unpaid visits. All customer balances are up to date.
						</p>
					) : (
						<ResponsiveTableWrapper>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Protocol</TableHead>
										<TableHead>Patient</TableHead>
										<TableHead>Owner</TableHead>
										<TableHead>Date</TableHead>
										<TableHead>Total</TableHead>
										<TableHead>Paid</TableHead>
										<TableHead>Balance</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{unpaidVisits.map((visit) => (
										<TableRow key={visit.id}>
											<TableCell>
												<Badge variant="outline">PRO-{visit.protocolNumber}</Badge>
											</TableCell>
											<TableCell>
												<div>
													<div className="font-medium">{visit.pet.name}</div>
													<div className="text-xs text-muted-foreground">
														{visit.pet.patientNumber}
													</div>
												</div>
											</TableCell>
											<TableCell>
												{visit.pet.owner.name || visit.pet.owner.email}
											</TableCell>
											<TableCell>
												{format(new Date(visit.visitDate), "MMM dd, yyyy")}
											</TableCell>
											<TableCell>{formatCurrency(visit.totalAmount)}</TableCell>
											<TableCell>{formatCurrency(visit.paidAmount)}</TableCell>
											<TableCell>
												<span className="font-semibold text-amber-600">
													{formatCurrency(visit.balance)}
												</span>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Button
														variant="outline"
														size="sm"
														asChild
													>
														<Link href={`/admin/visits/${visit.id}`}>View</Link>
													</Button>
													<Button
														size="sm"
														onClick={() => handleOpenPayment(visit)}
													>
														<DollarSign className="w-4 h-4 mr-1" />
														Record Payment
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</ResponsiveTableWrapper>
					)}
				</CardContent>
			</Card>

			{/* Payment Dialog */}
			<Dialog
				open={!!selectedVisit}
				onOpenChange={(open) => !open && setSelectedVisit(null)}
			>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Record Payment</DialogTitle>
						<DialogDescription>
							{selectedVisit && (
								<>
									PRO-{selectedVisit.protocolNumber} • {selectedVisit.petName} • Balance:{" "}
									{formatCurrency(selectedVisit.balance)}
								</>
							)}
						</DialogDescription>
					</DialogHeader>

					{selectedVisit && (
						<div className="space-y-4">
							{/* Payment type */}
							<div>
								<Label>Payment type</Label>
								<div className="grid grid-cols-3 gap-2 mt-2">
									<Button
										type="button"
										variant={paymentType === "partial" ? "default" : "outline"}
										size="sm"
										onClick={() => setPaymentType("partial")}
									>
										Partial
									</Button>
									<Button
										type="button"
										variant={paymentType === "full" ? "default" : "outline"}
										size="sm"
										onClick={() => setPaymentType("full")}
									>
										Full Payment
									</Button>
									<Button
										type="button"
										variant={paymentType === "mark" ? "default" : "outline"}
										size="sm"
										onClick={() => setPaymentType("mark")}
									>
										Mark as Paid
									</Button>
								</div>
							</div>

							{paymentType === "partial" && (
								<div>
									<Label>Amount</Label>
									<Input
										type="number"
										step="0.01"
										min="0"
										max={selectedVisit.balance}
										value={paymentAmount}
										onChange={(e) => setPaymentAmount(e.target.value)}
										placeholder={`Max: ${formatCurrency(selectedVisit.balance)}`}
										className="mt-2"
									/>
								</div>
							)}

							<div>
								<Label>Method</Label>
								<Select value={paymentMethod} onValueChange={setPaymentMethod}>
									<SelectTrigger className="mt-2">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="cash">Cash</SelectItem>
										<SelectItem value="card">Card</SelectItem>
										<SelectItem value="stripe">Stripe</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label>Notes (optional)</Label>
								<Input
									value={paymentNotes}
									onChange={(e) => setPaymentNotes(e.target.value)}
									placeholder="Payment notes"
									className="mt-2"
								/>
							</div>

							<div className="flex gap-2 pt-4">
								<Button
									variant="outline"
									onClick={() => setSelectedVisit(null)}
									className="flex-1"
								>
									Cancel
								</Button>
								{paymentType === "mark" ? (
									<Button
										onClick={handleMarkAsPaid}
										disabled={addPayment.isPending}
										className="flex-1"
									>
										{addPayment.isPending ? "Processing..." : "Mark as Paid"}
									</Button>
								) : (
									<Button
										onClick={handleRecordPayment}
										disabled={
											addPayment.isPending ||
											(paymentType === "partial" && (!paymentAmount || Number(paymentAmount) <= 0))
										}
										className="flex-1"
									>
										{addPayment.isPending ? "Recording..." : "Record Payment"}
									</Button>
								)}
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}
