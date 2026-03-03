"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
	Stethoscope, CreditCard, Plus, Trash2, Download,
	Calendar, User, PawPrint, Hash, Banknote, CheckCircle2,
	Clock, XCircle, Package, ClipboardList, Syringe,
} from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { useState, useEffect } from "react"
import {
	useVisit, useAddVisitService, useRemoveVisitService,
	useAddVisitPayment, useSaveVisitMedicalRecord, type Visit,
} from "@/lib/react-query/hooks/visits"
import { usePetServices } from "@/lib/react-query/hooks/pet-services"
import { toast } from "sonner"
import { currentUserClient } from "@/lib/auth/client"
import { VisitStockUsages } from "@/components/features/stocks/VisitStockUsages"
import { useCurrency } from "@/components/providers/CurrencyProvider"
import { generateVisitPDF } from "@/lib/utils/visit-pdf"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface VisitDetailProps { visit: Visit }

const PAYMENT_METHODS = [
	{ value: "nakit", label: "Nakit" },
	{ value: "kart", label: "Kredi/Banka Kartı" },
	{ value: "havale", label: "Havale / EFT" },
	{ value: "stripe", label: "Stripe" },
]

function StatusBadge({ status, balance }: { status: string; balance: number }) {
	if (status === "İptal Edildi") return <span className="vd-status vd-status-cancelled"><XCircle className="w-3.5 h-3.5" />İptal Edildi</span>
	if (balance <= 0) return <span className="vd-status vd-status-paid"><CheckCircle2 className="w-3.5 h-3.5" />Ödendi</span>
	return <span className="vd-status vd-status-outstanding"><Clock className="w-3.5 h-3.5" />Bekliyor</span>
}

export function VisitDetail({ visit: initialVisit }: VisitDetailProps) {
	const { formatCurrency, currency } = useCurrency()
	const { data: visitData } = useVisit(initialVisit.id)
	const visit = visitData || initialVisit
	const currentUser = currentUserClient()
	const canEdit = currentUser && (currentUser.isStaff || currentUser.isAdmin || currentUser.isSuperAdmin)
	const pathname = usePathname()
	const petBasePath = pathname?.startsWith("/admin") ? "/admin/pets" : "/customer/pets"

	const { data: servicesData } = usePetServices({ active: true, limit: 100 })
	const services = servicesData?.services || []

	const addService = useAddVisitService(visit.id)
	const removeService = useRemoveVisitService(visit.id)
	const addPayment = useAddVisitPayment(visit.id)
	const saveMedicalRecord = useSaveVisitMedicalRecord(visit.id)

	const [activeTab, setActiveTab] = useState("services")
	const [paymentMethod, setPaymentMethod] = useState("nakit")
	const [paymentAmount, setPaymentAmount] = useState("")
	const [paymentNotes, setPaymentNotes] = useState("")
	const [addServiceOpen, setAddServiceOpen] = useState(false)
	const [addPaymentOpen, setAddPaymentOpen] = useState(false)
	const [selectedServiceId, setSelectedServiceId] = useState("")
	const [serviceQty, setServiceQty] = useState(1)

	const [complaints, setComplaints] = useState(visit.medicalRecord?.complaints || "")
	const [examinationNotes, setExaminationNotes] = useState(visit.medicalRecord?.examinationNotes || "")
	const [diagnosis, setDiagnosis] = useState(visit.medicalRecord?.diagnosis || "")
	const [treatmentsPerformed, setTreatmentsPerformed] = useState(visit.medicalRecord?.treatmentsPerformed || "")
	const [recommendations, setRecommendations] = useState(visit.medicalRecord?.recommendations || "")

	useEffect(() => {
		setComplaints(visit.medicalRecord?.complaints || "")
		setExaminationNotes(visit.medicalRecord?.examinationNotes || "")
		setDiagnosis(visit.medicalRecord?.diagnosis || "")
		setTreatmentsPerformed(visit.medicalRecord?.treatmentsPerformed || "")
		setRecommendations(visit.medicalRecord?.recommendations || "")
	}, [visit.medicalRecord])

	const balance = visit.totalAmount - visit.paidAmount
	const isPaid = balance <= 0
	const payPct = visit.totalAmount > 0 ? Math.min(100, Math.round((visit.paidAmount / visit.totalAmount) * 100)) : 0

	const selectedService = services.find((s: any) => s.id === selectedServiceId)
	const servicePreviewTotal = selectedService ? selectedService.price * serviceQty : 0

	const handleDownloadPDF = () => {
		try { generateVisitPDF(visit, currency); toast.success("PDF indirildi") }
		catch (e: any) { toast.error(e?.message || "PDF oluşturulamadı") }
	}

	const handleAddService = async () => {
		if (!selectedServiceId) { toast.error("Hizmet seçin"); return }
		try {
			await addService.mutateAsync({ serviceId: selectedServiceId, quantity: serviceQty })
			toast.success("Hizmet eklendi")
			setAddServiceOpen(false)
			setSelectedServiceId(""); setServiceQty(1)
		} catch (e: any) { toast.error(e?.info?.error || "Hizmet eklenemedi") }
	}

	const handleAddPayment = async (fullPay = false) => {
		const amt = fullPay ? balance : Number(paymentAmount)
		if (!amt || amt <= 0) { toast.error("Geçerli tutar girin"); return }
		if (amt > balance) { toast.error(`Bakiyeyi aşıyor (${formatCurrency(balance)})`); return }
		try {
			await addPayment.mutateAsync({ method: paymentMethod, amount: amt, notes: paymentNotes || undefined })
			toast.success(fullPay ? "Tam ödeme kaydedildi" : "Ödeme kaydedildi")
			setAddPaymentOpen(false); setPaymentAmount(""); setPaymentNotes("")
		} catch (e: any) { toast.error(e?.info?.error || "Ödeme kaydedilemedi") }
	}

	const handleSaveMedicalRecord = async () => {
		try {
			await saveMedicalRecord.mutateAsync({
				complaints: complaints || undefined,
				examinationNotes: examinationNotes || undefined,
				diagnosis: diagnosis || undefined,
				treatmentsPerformed: treatmentsPerformed || undefined,
				recommendations: recommendations || undefined,
			})
			toast.success("Tıbbi kayıt kaydedildi")
		} catch (e: any) { toast.error(e?.info?.error || "Kaydedilemedi") }
	}

	const TABS = [
		{ key: "services", label: "Hizmetler", icon: <ClipboardList className="w-4 h-4" /> },
		{ key: "stocks", label: "İlaç / Malzeme", icon: <Package className="w-4 h-4" /> },
		{ key: "medical", label: "Tıbbi Kayıt", icon: <Stethoscope className="w-4 h-4" /> },
		{ key: "payments", label: "Ödemeler", icon: <CreditCard className="w-4 h-4" /> },
	]

	return (
		<div className="vd-wrap">

			{/* ── HEADER KARTI ── */}
			<div className="vd-hero">
				<div className="vd-hero-left">
					<div className="vd-proto-badge">PRO-{visit.protocolNumber}</div>
					<div>
						<div className="vd-hero-name">
							<PawPrint className="w-5 h-5" />
							{visit.pet?.id
								? <Link href={`${petBasePath}/${visit.pet.id}`} className="vd-pet-link">{visit.pet.name}</Link>
								: visit.pet?.name}
							<StatusBadge status={visit.status} balance={balance} />
						</div>
						<div className="vd-hero-meta">
							{visit.pet?.patientNumber && <span><Hash className="w-3 h-3" />{visit.pet.patientNumber}</span>}
							{visit.pet?.species && <span><Syringe className="w-3 h-3" />{visit.pet.species}{visit.pet.breed ? ` · ${visit.pet.breed}` : ""}</span>}
							{visit.pet?.owner && <span><User className="w-3 h-3" />{visit.pet.owner.name || visit.pet.owner.email}</span>}
							<span><Calendar className="w-3 h-3" />{format(new Date(visit.visitDate), "d MMMM yyyy · HH:mm", { locale: tr })}</span>
						</div>
					</div>
				</div>

				<div className="vd-hero-right">
					<button className="vd-pdf-btn" onClick={handleDownloadPDF}>
						<Download className="w-4 h-4" />PDF İndir
					</button>
					<div className="vd-finance">
						<div className="vd-total">{formatCurrency(visit.totalAmount)}</div>
						<div className="vd-finance-row">
							<span className="vd-paid-label">Ödenen</span>
							<span className="vd-paid-val">{formatCurrency(visit.paidAmount)}</span>
							<span className="vd-sep">·</span>
							<span className="vd-balance-label">Kalan</span>
							<span className={`vd-balance-val ${balance > 0 ? "vd-balance-due" : "vd-balance-ok"}`}>{formatCurrency(balance)}</span>
						</div>
						{visit.totalAmount > 0 && (
							<div className="vd-progress-wrap">
								<div className="vd-progress-bar">
									<div className="vd-progress-fill" style={{ width: `${payPct}%` }} />
								</div>
								<span className="vd-progress-pct">{payPct}%</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* ── SEKMELER ── */}
			<div className="vd-tabs">
				{TABS.map(t => (
					<button key={t.key} className={`vd-tab ${activeTab === t.key ? "vd-tab-active" : ""}`} onClick={() => setActiveTab(t.key)}>
						{t.icon}{t.label}
					</button>
				))}
			</div>

			{/* ── HİZMETLER ── */}
			{activeTab === "services" && (
				<div className="vd-panel">
					<div className="vd-panel-hd">
						<div>
							<div className="vd-panel-title"><ClipboardList className="w-4 h-4" />Hizmetler</div>
							<div className="vd-panel-sub">Bu ziyarete eklenen hizmetler</div>
						</div>
						{canEdit && visit.status !== "CANCELLED" && (
							<Dialog open={addServiceOpen} onOpenChange={setAddServiceOpen}>
								<DialogTrigger asChild>
									<button className="vd-add-btn"><Plus className="w-4 h-4" />Hizmet Ekle</button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader><DialogTitle>Hizmet Ekle</DialogTitle></DialogHeader>
									<div className="vd-modal-body">
										<div className="vd-field">
											<Label>Hizmet</Label>
											<Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
												<SelectTrigger><SelectValue placeholder="Hizmet seçin..." /></SelectTrigger>
												<SelectContent>
													{services.map((s: any) => (
														<SelectItem key={s.id} value={s.id}>
															{s.title} — {formatCurrency(s.price)}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className="vd-field">
											<Label>Miktar</Label>
											<Input type="number" min={1} value={serviceQty} onChange={e => setServiceQty(Number(e.target.value))} />
										</div>
										{selectedService && (
											<div className="vd-preview-total">
												Toplam: <strong>{formatCurrency(servicePreviewTotal)}</strong>
											</div>
										)}
										<div className="vd-modal-actions">
											<button className="vd-btn-ghost" onClick={() => setAddServiceOpen(false)}>İptal</button>
											<button className="vd-btn-primary" onClick={handleAddService} disabled={addService.isPending}>
												{addService.isPending ? "Ekleniyor..." : "Ekle"}
											</button>
										</div>
									</div>
								</DialogContent>
							</Dialog>
						)}
					</div>
					<div className="vd-table-wrap">
						{visit.services && visit.services.length > 0 ? (
							<table className="vd-table">
								<thead>
									<tr>
										<th className="vd-th">Hizmet</th>
										<th className="vd-th">Adet</th>
										<th className="vd-th">Birim Fiyat</th>
										<th className="vd-th vd-th-right">Toplam</th>
										{canEdit && visit.status !== "CANCELLED" && <th className="vd-th" />}
									</tr>
								</thead>
								<tbody>
									{visit.services.map((vs: any) => (
										<tr key={vs.id} className="vd-tr">
											<td className="vd-td"><span className="vd-service-name">{vs.service?.title}</span></td>
											<td className="vd-td">{vs.quantity}</td>
											<td className="vd-td">{formatCurrency(vs.unitPrice)}</td>
											<td className="vd-td vd-td-right vd-td-bold">{formatCurrency(vs.total)}</td>
											{canEdit && visit.status !== "CANCELLED" && (
												<td className="vd-td vd-td-action">
													<button className="vd-del-btn" onClick={() => { if (confirm("Bu hizmeti kaldırmak istediğinizden emin misiniz?")) removeService.mutate(vs.id) }}>
														<Trash2 className="w-3.5 h-3.5" />
													</button>
												</td>
											)}
										</tr>
									))}
								</tbody>
							</table>
						) : (
							<div className="vd-empty"><ClipboardList className="w-8 h-8" /><span>Henüz hizmet eklenmedi</span></div>
						)}
					</div>
					<div className="vd-total-row">Toplam: <strong>{formatCurrency(visit.totalAmount)}</strong></div>
				</div>
			)}

			{/* ── İLAÇ / MALZEME ── */}
			{activeTab === "stocks" && (
				<div className="vd-panel">
					<VisitStockUsages visitId={visit.id} visitStatus={visit.status} />
				</div>
			)}

			{/* ── TIBBİ KAYIT ── */}
			{activeTab === "medical" && (
				<div className="vd-panel">
					<div className="vd-panel-hd">
						<div>
							<div className="vd-panel-title"><Stethoscope className="w-4 h-4" />Tıbbi Kayıt (Epikriz)</div>
							<div className="vd-panel-sub">Şikayet, muayene, tanı, tedavi, öneriler</div>
						</div>
					</div>
					{canEdit ? (
						<div className="vd-medical-form">
							<div className="vd-field">
								<Label>Şikayetler</Label>
								<Textarea value={complaints} onChange={e => setComplaints(e.target.value)} placeholder="Hasta şikayetleri..." rows={2} />
							</div>
							<div className="vd-field">
								<Label>Muayene Bulguları</Label>
								<Textarea value={examinationNotes} onChange={e => setExaminationNotes(e.target.value)} placeholder="Fizik muayene bulguları..." rows={3} />
							</div>
							<div className="vd-field">
								<Label>Tanı</Label>
								<Textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Tanı..." rows={2} />
							</div>
							<div className="vd-field">
								<Label>Uygulanan Tedaviler</Label>
								<Textarea value={treatmentsPerformed} onChange={e => setTreatmentsPerformed(e.target.value)} placeholder="Uygulanan tedaviler..." rows={2} />
							</div>
							<div className="vd-field">
								<Label>Öneriler</Label>
								<Textarea value={recommendations} onChange={e => setRecommendations(e.target.value)} placeholder="Takip önerileri..." rows={2} />
							</div>
							<div className="vd-modal-actions">
								<button className="vd-btn-primary" onClick={handleSaveMedicalRecord} disabled={saveMedicalRecord.isPending}>
									{saveMedicalRecord.isPending ? "Kaydediliyor..." : "Tıbbi Kaydı Kaydet"}
								</button>
							</div>
						</div>
					) : (
						<div className="vd-medical-view">
							{visit.medicalRecord ? (
								[
									{ label: "Şikayetler", val: visit.medicalRecord.complaints },
									{ label: "Muayene Bulguları", val: visit.medicalRecord.examinationNotes },
									{ label: "Tanı", val: visit.medicalRecord.diagnosis },
									{ label: "Uygulanan Tedaviler", val: visit.medicalRecord.treatmentsPerformed },
									{ label: "Öneriler", val: visit.medicalRecord.recommendations },
								].filter(f => f.val).map(f => (
									<div key={f.label} className="vd-medical-field">
										<div className="vd-medical-label">{f.label}</div>
										<p className="vd-medical-text">{f.val}</p>
									</div>
								))
							) : (
								<div className="vd-empty"><Stethoscope className="w-8 h-8" /><span>Henüz tıbbi kayıt girilmedi</span></div>
							)}
						</div>
					)}
				</div>
			)}

			{/* ── ÖDEMELER ── */}
			{activeTab === "payments" && (
				<div className="vd-panel">
					<div className="vd-panel-hd">
						<div>
							<div className="vd-panel-title"><CreditCard className="w-4 h-4" />Ödemeler</div>
							<div className="vd-panel-sub">Kısmi veya tam ödeme kaydı</div>
						</div>
						{canEdit && balance > 0 && (
							<Dialog open={addPaymentOpen} onOpenChange={setAddPaymentOpen}>
								<DialogTrigger asChild>
									<button className="vd-add-btn"><Plus className="w-4 h-4" />Ödeme Ekle</button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader><DialogTitle>Ödeme Kaydet</DialogTitle></DialogHeader>
									<div className="vd-modal-body">
										<div className="vd-balance-info">
											Kalan bakiye: <strong>{formatCurrency(balance)}</strong>
										</div>
										<div className="vd-field">
											<Label>Ödeme Yöntemi</Label>
											<Select value={paymentMethod} onValueChange={setPaymentMethod}>
												<SelectTrigger><SelectValue /></SelectTrigger>
												<SelectContent>
													{PAYMENT_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
												</SelectContent>
											</Select>
										</div>
										<div className="vd-field">
											<Label>Tutar</Label>
											<Input type="number" step="0.01" min="0" max={balance} value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder={`Maks. ${formatCurrency(balance)}`} />
										</div>
										<div className="vd-field">
											<Label>Not (opsiyonel)</Label>
											<Input value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} placeholder="Ödeme notu..." />
										</div>
										<div className="vd-modal-actions">
											<button className="vd-btn-ghost" onClick={() => setAddPaymentOpen(false)}>İptal</button>
											<button className="vd-btn-outline" onClick={() => handleAddPayment(false)} disabled={addPayment.isPending}>
												Kısmi Ödeme
											</button>
											<button className="vd-btn-green" onClick={() => handleAddPayment(true)} disabled={addPayment.isPending}>
												<Banknote className="w-4 h-4" />Tümünü Öde ({formatCurrency(balance)})
											</button>
										</div>
									</div>
								</DialogContent>
							</Dialog>
						)}
					</div>

					{/* Ödeme özet kartları */}
					<div className="vd-pay-summary">
						<div className="vd-pay-card">
							<div className="vd-pay-card-label">Toplam</div>
							<div className="vd-pay-card-val">{formatCurrency(visit.totalAmount)}</div>
						</div>
						<div className="vd-pay-card vd-pay-card-paid">
							<div className="vd-pay-card-label">Ödenen</div>
							<div className="vd-pay-card-val">{formatCurrency(visit.paidAmount)}</div>
						</div>
						<div className={`vd-pay-card ${balance > 0 ? "vd-pay-card-due" : "vd-pay-card-ok"}`}>
							<div className="vd-pay-card-label">Kalan</div>
							<div className="vd-pay-card-val">{formatCurrency(balance)}</div>
						</div>
					</div>

					<div className="vd-table-wrap">
						{visit.payments && visit.payments.length > 0 ? (
							<table className="vd-table">
								<thead>
									<tr>
										<th className="vd-th">Tarih</th>
										<th className="vd-th">Yöntem</th>
										<th className="vd-th">Tutar</th>
										<th className="vd-th">Durum</th>
										<th className="vd-th">Not</th>
									</tr>
								</thead>
								<tbody>
									{visit.payments.map((p: any) => (
										<tr key={p.id} className="vd-tr">
											<td className="vd-td">{format(new Date(p.paidAt), "d MMM yyyy · HH:mm", { locale: tr })}</td>
											<td className="vd-td"><span className="vd-method-badge">{PAYMENT_METHODS.find(m => m.value === p.method)?.label || p.method}</span></td>
											<td className="vd-td vd-td-bold">{formatCurrency(p.amount)}</td>
											<td className="vd-td">
												<Badge variant={p.status === "Tamamlandı" ? "default" : "secondary"}>{p.status}</Badge>
											</td>
											<td className="vd-td vd-td-muted">{p.notes || "—"}</td>
										</tr>
									))}
								</tbody>
							</table>
						) : (
							<div className="vd-empty"><CreditCard className="w-8 h-8" /><span>Henüz ödeme kaydı yok</span></div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
