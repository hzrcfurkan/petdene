"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import {
	Stethoscope,
	DollarSign,
	Plus,
	Trash2,
	FileText,
	CreditCard,
	User,
	Calendar,
	Download,
} from "lucide-react"
import { format } from "date-fns"
import { useState, useEffect } from "react"
import {
	useVisit,
	useAddVisitService,
	useRemoveVisitService,
	useAddVisitPayment,
	useSaveVisitMedicalRecord,
	type Visit,
} from "@/lib/react-query/hooks/visits"
import { usePetServices } from "@/lib/react-query/hooks/pet-services"
import { toast } from "sonner"
import { currentUserClient } from "@/lib/auth/client"
import { VisitStockUsages } from "@/components/features/stocks/VisitStockUsages"
import { useCurrency } from "@/components/providers/CurrencyProvider"
import { generateVisitPDF } from "@/lib/utils/visit-pdf"

interface VisitDetailProps {
	visit: Visit
}

export function VisitDetail({ visit: initialVisit }: VisitDetailProps) {
	const { formatCurrency, currency } = useCurrency()
	const { data: visitData } = useVisit(initialVisit.id)
	const visit = visitData || initialVisit
	const currentUser = currentUserClient()
	const canEdit = currentUser && (currentUser.isStaff || currentUser.isAdmin || currentUser.isSuperAdmin)

	const { data: servicesData } = usePetServices({ active: true, limit: 100 })
	const services = servicesData?.services || []

	const addService = useAddVisitService(visit.id)
	const removeService = useRemoveVisitService(visit.id)
	const addPayment = useAddVisitPayment(visit.id)
	const saveMedicalRecord = useSaveVisitMedicalRecord(visit.id)

	const [paymentMethod, setPaymentMethod] = useState("nakit")
	const [paymentAmount, setPaymentAmount] = useState("")
	const [paymentNotes, setPaymentNotes] = useState("")
	const [addServiceOpen, setAddServiceOpen] = useState(false)
	const [addPaymentOpen, setAddPaymentOpen] = useState(false)

	// Medical record (Epicrisis) form state - sync when visit data updates
	const [complaints, setComplaints] = useState(visit.medicalRecord?.complaints || "")
	const [examinationNotes, setExaminationNotes] = useState(
		visit.medicalRecord?.examinationNotes || ""
	)
	const [diagnosis, setDiagnosis] = useState(visit.medicalRecord?.diagnosis || "")
	const [treatmentsPerformed, setTreatmentsPerformed] = useState(
		visit.medicalRecord?.treatmentsPerformed || ""
	)
	const [recommendations, setRecommendations] = useState(
		visit.medicalRecord?.recommendations || ""
	)

	useEffect(() => {
		setComplaints(visit.medicalRecord?.complaints || "")
		setExaminationNotes(visit.medicalRecord?.examinationNotes || "")
		setDiagnosis(visit.medicalRecord?.diagnosis || "")
		setTreatmentsPerformed(visit.medicalRecord?.treatmentsPerformed || "")
		setRecommendations(visit.medicalRecord?.recommendations || "")
	}, [visit.medicalRecord])

	const balance = visit.totalAmount - visit.paidAmount
	const isPaid = balance <= 0

	const handleDownloadPDF = () => {
		try {
			generateVisitPDF(visit, currency)
			toast.success("Ziyaret PDF indirildi")
		} catch (error: any) {
			toast.error(error?.message || "PDF oluşturulamadı")
		}
	}

	const handleAddService = async (e: React.FormEvent) => {
		e.preventDefault()
		const form = e.target as HTMLFormElement
		const serviceId = (form.elements.namedItem("serviceId") as HTMLSelectElement)?.value
		const quantity = Number((form.elements.namedItem("quantity") as HTMLInputElement)?.value) || 1
		if (!serviceId) {
			toast.error("Hizmet seçin")
			return
		}
		try {
			await addService.mutateAsync({ serviceId, quantity })
			toast.success("Hizmet eklendi")
			setAddServiceOpen(false)
		} catch (err: any) {
			toast.error(err?.info?.error || "Hizmet eklenemedi")
		}
	}

	const handleAddPayment = async (e: React.FormEvent) => {
		e.preventDefault()
		const amt = Number(paymentAmount)
		if (!amt || amt <= 0) {
			toast.error("Geçerli tutar girin")
			return
		}
		if (amt > balance) {
			toast.error(`Amount exceeds balance (${formatCurrency(balance)})`)
			return
		}
		try {
			await addPayment.mutateAsync({
				method: paymentMethod,
				amount: amt,
				notes: paymentNotes || undefined,
			})
			toast.success("Ödeme kaydedildi")
			setAddPaymentOpen(false)
			setPaymentAmount("")
			setPaymentNotes("")
		} catch (err: any) {
			toast.error(err?.info?.error || "Ödeme kaydedilemedi")
		}
	}

	const handleSaveMedicalRecord = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			await saveMedicalRecord.mutateAsync({
				complaints: complaints || undefined,
				examinationNotes: examinationNotes || undefined,
				diagnosis: diagnosis || undefined,
				treatmentsPerformed: treatmentsPerformed || undefined,
				recommendations: recommendations || undefined,
			})
			toast.success("Tıbbi kayıt kaydedildi")
		} catch (err: any) {
			toast.error(err?.info?.error || "Kaydedilemedi")
		}
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex items-start gap-4">
					<div>
						<h2 className="text-2xl font-bold flex items-center gap-2">
						<Badge variant="outline" className="text-lg">
							PRO-{visit.protocolNumber}
						</Badge>
						{visit.pet?.name}
					</h2>
					<p className="text-muted-foreground text-sm mt-1">
						{visit.pet?.patientNumber} • {visit.pet?.species}
						{visit.pet?.owner && ` • Owner: ${visit.pet.owner.name || visit.pet.owner.email}`}
					</p>
					<p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
						<Calendar className="w-4 h-4" />
						{format(new Date(visit.visitDate), "MMMM dd, yyyy HH:mm")}
					</p>
					</div>
					<Button variant="outline" size="sm" onClick={handleDownloadPDF}>
						<Download className="w-4 h-4 mr-2" />
						Download PDF
					</Button>
				</div>
				<div className="flex flex-col items-end gap-1">
					<div className="text-2xl font-bold">{formatCurrency(visit.totalAmount)}</div>
					<div className="text-sm text-muted-foreground">
						Paid: {formatCurrency(visit.paidAmount)} • Balance:{" "}
						<span className={balance > 0 ? "text-destructive font-medium" : ""}>
							{formatCurrency(balance)}
						</span>
					</div>
					{balance > 0 && (
						<Badge variant="outline" className="text-amber-600 border-amber-600">
							Outstanding
						</Badge>
					)}
					{isPaid && visit.totalAmount > 0 && (
						<Badge variant="default">Ödenen</Badge>
					)}
				</div>
			</div>

			<Tabs defaultValue="services" className="w-full">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="services">Services</TabsTrigger>
					<TabsTrigger value="stocks">İlaç / Malzeme</TabsTrigger>
					<TabsTrigger value="medical">Medical Record</TabsTrigger>
					<TabsTrigger value="payments">Payments</TabsTrigger>
				</TabsList>

				<TabsContent value="services" className="space-y-4">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Services</CardTitle>
									<CardDescription>Services added to this visit</CardDescription>
								</div>
								{canEdit && visit.status !== "İptal Edildi" && (
									<Dialog open={addServiceOpen} onOpenChange={setAddServiceOpen}>
										<DialogTrigger asChild>
											<Button size="sm">
												<Plus className="w-4 h-4 mr-2" />
												Add Service
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Add Service</DialogTitle>
												<DialogDescription>
													Add a service to this visit. Price and quantity will determine the total.
												</DialogDescription>
											</DialogHeader>
											<form onSubmit={handleAddService} className="space-y-4">
												<div>
													<Label>Hizmet</Label>
													<Select name="serviceId" required>
														<SelectTrigger>
															<SelectValue placeholder="Hizmet seçin" />
														</SelectTrigger>
														<SelectContent>
															{services.map((s: any) => (
																<SelectItem key={s.id} value={s.id}>
																	{s.title} - {formatCurrency(s.price)}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
												<div>
													<Label>Quantity</Label>
													<Input
														name="quantity"
														type="number"
														min={1}
														defaultValue={1}
													/>
												</div>
												<Button type="submit" disabled={addService.isPending}>
													{addService.isPending ? "Ekleniyor..." : "Ekle"}
												</Button>
											</form>
										</DialogContent>
									</Dialog>
								)}
							</div>
						</CardHeader>
						<CardContent>
							{visit.services && visit.services.length > 0 ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Hizmet</TableHead>
											<TableHead>Qty</TableHead>
											<TableHead>Unit Price</TableHead>
											<TableHead className="text-right">Toplam</TableHead>
											{canEdit && visit.status !== "İptal Edildi" && <TableHead />}
										</TableRow>
									</TableHeader>
									<TableBody>
										{visit.services.map((vs: any) => (
											<TableRow key={vs.id}>
												<TableCell>{vs.service?.title}</TableCell>
												<TableCell>{vs.quantity}</TableCell>
												<TableCell>{formatCurrency(vs.unitPrice)}</TableCell>
												<TableCell className="text-right font-medium">
													{formatCurrency(vs.total)}
												</TableCell>
												{canEdit && visit.status !== "İptal Edildi" && (
													<TableCell>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => {
																if (confirm("Bu hizmeti kaldırmak istediğinizden emin misiniz?")) {
																	removeService.mutate(vs.id)
																}
															}}
														>
															<Trash2 className="w-4 h-4 text-destructive" />
														</Button>
													</TableCell>
												)}
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<p className="text-muted-foreground text-sm">No services added yet.</p>
							)}
							<div className="mt-4 pt-4 border-t font-semibold text-right">
								Total: {formatCurrency(visit.totalAmount)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>


			<TabsContent value="stocks" className="space-y-4">
				<VisitStockUsages visitId={visit.id} visitStatus={visit.status} />
			</TabsContent>

				<TabsContent value="medical" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Stethoscope className="w-5 h-5" />
								Medical Record (Epicrisis)
							</CardTitle>
							<CardDescription>
								Patient complaints, examination, diagnosis, treatments, recommendations
							</CardDescription>
						</CardHeader>
						<CardContent>
							{canEdit ? (
								<form onSubmit={handleSaveMedicalRecord} className="space-y-4">
									<div>
										<Label>Patient Complaints</Label>
										<Textarea
											value={complaints}
											onChange={(e) => setComplaints(e.target.value)}
											placeholder="Şikayetler..."
											rows={2}
										/>
									</div>
									<div>
										<Label>Examination Notes</Label>
										<Textarea
											value={examinationNotes}
											onChange={(e) => setExaminationNotes(e.target.value)}
											placeholder="Fizik muayene bulguları..."
											rows={3}
										/>
									</div>
									<div>
										<Label>Diagnosis</Label>
										<Textarea
											value={diagnosis}
											onChange={(e) => setDiagnosis(e.target.value)}
											placeholder="Tanı..."
											rows={2}
										/>
									</div>
									<div>
										<Label>Treatments Performed</Label>
										<Textarea
											value={treatmentsPerformed}
											onChange={(e) => setTreatmentsPerformed(e.target.value)}
											placeholder="Uygulanan tedaviler..."
											rows={2}
										/>
									</div>
									<div>
										<Label>Recommendations</Label>
										<Textarea
											value={recommendations}
											onChange={(e) => setRecommendations(e.target.value)}
											placeholder="Takip önerileri..."
											rows={2}
										/>
									</div>
									<Button type="submit" disabled={saveMedicalRecord.isPending}>
										{saveMedicalRecord.isPending ? "Kaydediliyor..." : "Tıbbi Kaydı Kaydet"}
									</Button>
								</form>
							) : (
								<div className="space-y-4">
									{visit.medicalRecord ? (
										<>
											{visit.medicalRecord.complaints && (
												<div>
													<div className="text-sm font-medium text-muted-foreground">Complaints</div>
													<p className="whitespace-pre-wrap">{visit.medicalRecord.complaints}</p>
												</div>
											)}
											{visit.medicalRecord.examinationNotes && (
												<div>
													<div className="text-sm font-medium text-muted-foreground">Examination</div>
													<p className="whitespace-pre-wrap">{visit.medicalRecord.examinationNotes}</p>
												</div>
											)}
											{visit.medicalRecord.diagnosis && (
												<div>
													<div className="text-sm font-medium text-muted-foreground">Diagnosis</div>
													<p className="whitespace-pre-wrap">{visit.medicalRecord.diagnosis}</p>
												</div>
											)}
											{visit.medicalRecord.treatmentsPerformed && (
												<div>
													<div className="text-sm font-medium text-muted-foreground">Treatments</div>
													<p className="whitespace-pre-wrap">{visit.medicalRecord.treatmentsPerformed}</p>
												</div>
											)}
											{visit.medicalRecord.recommendations && (
												<div>
													<div className="text-sm font-medium text-muted-foreground">Recommendations</div>
													<p className="whitespace-pre-wrap">{visit.medicalRecord.recommendations}</p>
												</div>
											)}
										</>
									) : (
										<p className="text-muted-foreground">No medical record yet.</p>
									)}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="payments" className="space-y-4">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="flex items-center gap-2">
										<CreditCard className="w-5 h-5" />
										Payments
									</CardTitle>
									<CardDescription>
										Partial payment, full payment, or mark as paid. Balance and reports update automatically.
									</CardDescription>
								</div>
								{canEdit && balance > 0 && (
									<Dialog open={addPaymentOpen} onOpenChange={setAddPaymentOpen}>
										<DialogTrigger asChild>
											<Button size="sm">
												<Plus className="w-4 h-4 mr-2" />
												Record Payment
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Record Payment</DialogTitle>
												<DialogDescription>
													Record partial or full payment. Remaining balance: {formatCurrency(balance)}
												</DialogDescription>
											</DialogHeader>
											<form onSubmit={handleAddPayment} className="space-y-4">
												<div>
													<Label>Method</Label>
													<Select value={paymentMethod} onValueChange={setPaymentMethod}>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="nakit">Cash</SelectItem>
															<SelectItem value="kart">Card</SelectItem>
															<SelectItem value="stripe">Stripe</SelectItem>
														</SelectContent>
													</Select>
												</div>
												<div>
													<Label>Tutar</Label>
													<Input
														type="number"
														step="0.01"
														min="0"
														max={balance}
														value={paymentAmount}
														onChange={(e) => setPaymentAmount(e.target.value)}
														placeholder={formatCurrency(balance)}
													/>
												</div>
												<div>
													<Label>Notes (optional)</Label>
													<Input
														value={paymentNotes}
														onChange={(e) => setPaymentNotes(e.target.value)}
														placeholder="Ödeme notu"
													/>
												</div>
												<div className="flex gap-2">
													<Button
														type="button"
														variant="outline"
														onClick={async () => {
															try {
																await addPayment.mutateAsync({
																	method: paymentMethod,
																	amount: balance,
																	notes: paymentNotes || undefined,
																})
																toast.success("Tam ödeme kaydedildi")
																setAddPaymentOpen(false)
																setPaymentAmount("")
																setPaymentNotes("")
															} catch (err: any) {
																toast.error(err?.info?.error || "Başarısız")
															}
														}}
														disabled={addPayment.isPending}
													>
														Mark as Paid ({formatCurrency(balance)})
													</Button>
													<Button type="submit" disabled={addPayment.isPending}>
														{addPayment.isPending ? "Kaydediliyor..." : "Kısmi Ödeme Kaydet"}
													</Button>
												</div>
											</form>
										</DialogContent>
									</Dialog>
								)}
							</div>
						</CardHeader>
						<CardContent>
							{visit.payments && visit.payments.length > 0 ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Tarih</TableHead>
											<TableHead>Method</TableHead>
											<TableHead>Tutar</TableHead>
											<TableHead>Durum</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{visit.payments.map((p: any) => (
											<TableRow key={p.id}>
												<TableCell>{format(new Date(p.paidAt), "MMM dd, yyyy HH:mm")}</TableCell>
												<TableCell className="capitalize">{p.method}</TableCell>
												<TableCell>{formatCurrency(p.amount)}</TableCell>
												<TableCell>
													<Badge variant={p.status === "Tamamlandı" ? "default" : "secondary"}>
														{p.status}
													</Badge>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<p className="text-muted-foreground text-sm">No payments recorded yet.</p>
							)}
							<div className="mt-4 pt-4 border-t flex justify-between">
								<span>Total Paid:</span>
								<span className="font-semibold">{formatCurrency(visit.paidAmount)}</span>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}
