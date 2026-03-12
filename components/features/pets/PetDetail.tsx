"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import {
	PawPrint, User, Phone, Mail, Stethoscope, Syringe, FileText,
	CreditCard, Plus, Eye, AlertCircle, Calendar, Weight,
	Palette, ChevronRight, Activity, TrendingDown, Clock, CheckCircle2
} from "lucide-react"
import { type Pet, usePet } from "@/lib/react-query/hooks/pets"
import { useVisits } from "@/lib/react-query/hooks/visits"
import { useVaccinations } from "@/lib/react-query/hooks/vaccinations"
import { usePrescriptions } from "@/lib/react-query/hooks/prescriptions"
import { useCurrency } from "@/components/providers/CurrencyProvider"
import { VisitForm } from "@/components/features/visits/VisitForm"
import { VisitDetail } from "@/components/features/visits/VisitDetail"
import { useRouter } from "next/navigation"

interface PetDetailProps { pet: Pet }

export function PetDetail({ pet: initialPet }: PetDetailProps) {
	const { data: petData } = usePet(initialPet.id)
	const pet = petData || initialPet
	const { formatCurrency } = useCurrency()
	const router = useRouter()

	const [showNewVisit, setShowNewVisit]     = useState(false)
	const [openVisitId, setOpenVisitId]       = useState<string | null>(null)

	const { data: visitsData,       refetch: refetchVisits }  = useVisits({ petId: pet.id, limit: 100 })
	const { data: vaccinationsData }                          = useVaccinations({ petId: pet.id, limit: 100 })
	const { data: prescriptionsData }                         = usePrescriptions({ petId: pet.id, limit: 100 })

	const visits        = visitsData?.visits        || []
	const vaccinations  = (vaccinationsData as any)?.vaccinations || (vaccinationsData as any)?.items || []
	const prescriptions = prescriptionsData?.prescriptions || []

	// Finansal özet
	const totalDebt   = visits.reduce((s, v) => s + Math.max(v.totalAmount - v.paidAmount, 0), 0)
	const totalPaid   = visits.reduce((s, v) => s + v.paidAmount, 0)
	const totalAvans  = visits.reduce((s, v) => { const o = v.paidAmount - v.totalAmount; return s + (o > 0 ? o : 0) }, 0)

	const openVisit = visits.find(v => v.id === openVisitId)

	// Renk / ikon yardımcıları
	const statusColor: Record<string, string> = {
		COMPLETED:   "bg-green-100 text-green-800",
		IN_PROGRESS: "bg-blue-100 text-blue-800",
		CANCELLED:   "bg-red-100 text-red-800",
	}
	const statusLabel: Record<string, string> = {
		COMPLETED:   "Tamamlandı",
		IN_PROGRESS: "Devam Ediyor",
		CANCELLED:   "İptal",
	}

	return (
		<div className="space-y-6">

			{/* ── Hasta başlık kartı ── */}
			<div className="rounded-2xl border bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-950/20 dark:to-blue-950/20 p-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="flex items-center gap-4">
						{pet.image ? (
							<img src={pet.image} alt={pet.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow" />
						) : (
							<div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
								<PawPrint className="w-8 h-8 text-violet-600" />
							</div>
						)}
						<div>
							<div className="flex items-center gap-2">
								<h2 className="text-2xl font-bold">{pet.name}</h2>
								<Badge variant="secondary" className="font-mono">{pet.patientNumber || "—"}</Badge>
							</div>
							<p className="text-muted-foreground text-sm mt-0.5">
								{pet.species}{pet.breed ? ` • ${pet.breed}` : ""}{pet.gender ? ` • ${pet.gender}` : ""}
								{pet.age ? ` • ${pet.age} yaş` : ""}
							</p>
							{pet.owner && (
								<p className="text-sm mt-1 flex items-center gap-1 text-muted-foreground">
									<User className="w-3.5 h-3.5" />
									<span className="font-medium text-foreground">{pet.owner.name || pet.owner.email}</span>
									{pet.owner.phone && <span className="ml-2">• {pet.owner.phone}</span>}
								</p>
							)}
						</div>
					</div>

					<Button
						onClick={() => setShowNewVisit(true)}
						className="bg-violet-600 hover:bg-violet-700 shrink-0"
					>
						<Plus className="w-4 h-4 mr-2" />
						Yeni Muayene Aç
					</Button>
				</div>

				{/* Özet sayaçlar */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
					{[
						{ label: "Toplam Muayene", value: visits.length,        icon: Stethoscope, color: "text-violet-600" },
						{ label: "Aşı Kaydı",      value: vaccinations.length,  icon: Syringe,     color: "text-blue-600" },
						{ label: "Reçete",          value: prescriptions.length, icon: FileText,    color: "text-emerald-600" },
						{ label: "Toplam Borç",    value: formatCurrency(totalDebt), icon: CreditCard, color: totalDebt > 0 ? "text-red-600" : "text-gray-500" },
					].map(item => (
						<div key={item.label} className="bg-white dark:bg-gray-900 rounded-xl p-3 flex items-center gap-3 shadow-sm">
							<item.icon className={`w-5 h-5 shrink-0 ${item.color}`} />
							<div>
								<p className="text-xs text-muted-foreground">{item.label}</p>
								<p className={`font-bold text-sm ${item.color}`}>{item.value}</p>
							</div>
						</div>
					))}
				</div>

				{totalAvans > 0 && (
					<div className="mt-3 flex items-center gap-2 text-sm bg-amber-50 dark:bg-amber-950/30 border border-amber-200 rounded-xl px-4 py-2">
						<AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
						<span>Bu hastanın <strong className="text-amber-700">{formatCurrency(totalAvans)} avans bakiyesi</strong> var — bir sonraki muayenede kullanılabilir.</span>
					</div>
				)}
			</div>

			{/* ── Sekmeler ── */}
			<Tabs defaultValue="visits" className="space-y-4">
				<TabsList className="h-10 p-1 bg-muted/60 rounded-xl gap-1 flex-wrap">
					<TabsTrigger value="visits" className="rounded-lg px-4 text-sm">
						<Stethoscope className="w-3.5 h-3.5 mr-1.5" />Muayeneler
						{visits.length > 0 && <span className="ml-1.5 bg-violet-100 text-violet-700 text-xs px-1.5 py-0.5 rounded-full">{visits.length}</span>}
					</TabsTrigger>
					<TabsTrigger value="vaccinations" className="rounded-lg px-4 text-sm">
						<Syringe className="w-3.5 h-3.5 mr-1.5" />Aşılar
						{vaccinations.length > 0 && <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">{vaccinations.length}</span>}
					</TabsTrigger>
					<TabsTrigger value="prescriptions" className="rounded-lg px-4 text-sm">
						<FileText className="w-3.5 h-3.5 mr-1.5" />Reçeteler
						{prescriptions.length > 0 && <span className="ml-1.5 bg-emerald-100 text-emerald-700 text-xs px-1.5 py-0.5 rounded-full">{prescriptions.length}</span>}
					</TabsTrigger>
					<TabsTrigger value="financial" className="rounded-lg px-4 text-sm">
						<CreditCard className="w-3.5 h-3.5 mr-1.5" />Finansal
						{totalDebt > 0 && <span className="ml-1.5 bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded-full">!</span>}
					</TabsTrigger>
					<TabsTrigger value="info" className="rounded-lg px-4 text-sm">
						<PawPrint className="w-3.5 h-3.5 mr-1.5" />Hasta Bilgileri
					</TabsTrigger>
				</TabsList>

				{/* ─── MUAYENEler ─── */}
				<TabsContent value="visits" className="space-y-3">
					{visits.length === 0 ? (
						<EmptyState icon={Stethoscope} title="Henüz muayene kaydı yok" desc="Yeni muayene açmak için yukarıdaki butonu kullanın." />
					) : visits.map(v => {
						const balance = v.totalAmount - v.paidAmount
						return (
							<div
								key={v.id}
								onClick={() => setOpenVisitId(v.id)}
								className="border rounded-xl p-4 flex items-center justify-between hover:bg-muted/40 cursor-pointer transition-colors group"
							>
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900 flex items-center justify-center shrink-0">
										<Activity className="w-4 h-4 text-violet-600" />
									</div>
									<div>
										<div className="flex items-center gap-2">
											<span className="font-semibold text-sm">PRO-{v.protocolNumber}</span>
											<Badge className={`text-xs ${statusColor[v.status] || "bg-gray-100 text-gray-700"}`}>
												{statusLabel[v.status] || v.status}
											</Badge>
										</div>
										<p className="text-xs text-muted-foreground mt-0.5">
											{format(new Date(v.visitDate), "d MMM yyyy, HH:mm", { locale: tr })}
											{v.medicalRecord?.diagnosis && <span className="ml-2">· {v.medicalRecord.diagnosis.slice(0, 40)}{v.medicalRecord.diagnosis.length > 40 ? "…" : ""}</span>}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-4">
									<div className="text-right">
										<p className="text-sm font-semibold">{formatCurrency(v.totalAmount)}</p>
										{balance > 0 && <p className="text-xs text-red-600 font-medium">{formatCurrency(balance)} borç</p>}
										{balance <= 0 && v.totalAmount > 0 && <p className="text-xs text-green-600">Ödendi ✓</p>}
									</div>
									<ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
								</div>
							</div>
						)
					})}
				</TabsContent>

				{/* ─── AŞILAR ─── */}
				<TabsContent value="vaccinations" className="space-y-3">
					{vaccinations.length === 0 ? (
						<EmptyState icon={Syringe} title="Henüz aşı kaydı yok" desc="Aşı eklemek için Aşılar menüsünü kullanın." />
					) : vaccinations.map((v: any) => {
						const isPlanned = v.isPlanned
						const date = isPlanned ? v.scheduledDate : v.dateGiven
						const isOverdue = !isPlanned && v.nextDue && new Date(v.nextDue) < new Date()
						return (
							<div key={v.id} className="border rounded-xl p-4 flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPlanned ? "bg-blue-100 dark:bg-blue-900" : "bg-emerald-100 dark:bg-emerald-900"}`}>
										<Syringe className={`w-4 h-4 ${isPlanned ? "text-blue-600" : "text-emerald-600"}`} />
									</div>
									<div>
										<div className="flex items-center gap-2">
											<span className="font-semibold text-sm">{v.vaccineName}</span>
											<Badge className={`text-xs ${isPlanned ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
												{isPlanned ? "Planlandı" : "Uygulandı"}
											</Badge>
											{isOverdue && <Badge className="text-xs bg-red-100 text-red-700">Gecikti</Badge>}
										</div>
										<p className="text-xs text-muted-foreground mt-0.5">
											{date ? format(new Date(date), "d MMM yyyy", { locale: tr }) : "—"}
											{isPlanned && v.scheduledTime && ` · ${v.scheduledTime}`}
											{!isPlanned && v.nextDue && ` · Sonraki: ${format(new Date(v.nextDue), "d MMM yyyy", { locale: tr })}`}
										</p>
									</div>
								</div>
							</div>
						)
					})}
				</TabsContent>

				{/* ─── REÇETELER ─── */}
				<TabsContent value="prescriptions" className="space-y-3">
					{prescriptions.length === 0 ? (
						<EmptyState icon={FileText} title="Henüz reçete yok" desc="Reçeteler muayene sırasında oluşturulur." />
					) : prescriptions.map((p: any) => (
						<div key={p.id} className="border rounded-xl p-4 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
									<FileText className="w-4 h-4 text-emerald-600" />
								</div>
								<div>
									<p className="font-semibold text-sm">{p.title || `Reçete #${p.id.slice(0, 8)}`}</p>
									<p className="text-xs text-muted-foreground">
										{p.createdAt ? format(new Date(p.createdAt), "d MMM yyyy", { locale: tr }) : "—"}
										{p.items?.length > 0 && ` · ${p.items.length} ilaç`}
									</p>
								</div>
							</div>
							<Button size="sm" variant="outline" onClick={() => router.push(`/admin/prescriptions/${p.id}`)}>
								<Eye className="w-3.5 h-3.5 mr-1" />Görüntüle
							</Button>
						</div>
					))}
				</TabsContent>

				{/* ─── FİNANSAL ─── */}
				<TabsContent value="financial">
					<div className="grid gap-4 sm:grid-cols-3 mb-6">
						{[
							{ label: "Toplam Hizmet",  value: formatCurrency(visits.reduce((s,v)=>s+v.totalAmount,0)), icon: Activity,      color: "text-violet-600", bg: "bg-violet-50" },
							{ label: "Toplam Ödenen",  value: formatCurrency(totalPaid),   icon: CheckCircle2,  color: "text-green-600", bg: "bg-green-50" },
							{ label: "Kalan Borç",     value: formatCurrency(totalDebt),   icon: TrendingDown,  color: totalDebt > 0 ? "text-red-600" : "text-gray-500", bg: totalDebt > 0 ? "bg-red-50" : "bg-gray-50" },
						].map(c => (
							<div key={c.label} className={`rounded-2xl border p-5 flex items-center gap-4 ${c.bg}`}>
								<c.icon className={`w-5 h-5 ${c.color}`} />
								<div>
									<p className="text-xs text-muted-foreground">{c.label}</p>
									<p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
								</div>
							</div>
						))}
					</div>

					<div className="space-y-2">
						{visits.filter(v => v.totalAmount > 0 || v.paidAmount > 0).map(v => {
							const balance = v.totalAmount - v.paidAmount
							return (
								<div key={v.id} className="border rounded-xl p-4 flex items-center justify-between">
									<div>
										<span className="font-semibold text-sm">PRO-{v.protocolNumber}</span>
										<span className="text-xs text-muted-foreground ml-2">{format(new Date(v.visitDate), "d MMM yyyy", { locale: tr })}</span>
									</div>
									<div className="flex items-center gap-6 text-sm">
										<div className="text-right"><p className="text-xs text-muted-foreground">Hizmet</p><p className="font-medium">{formatCurrency(v.totalAmount)}</p></div>
										<div className="text-right"><p className="text-xs text-muted-foreground">Ödenen</p><p className="font-medium text-green-700">{formatCurrency(v.paidAmount)}</p></div>
										<div className="text-right"><p className="text-xs text-muted-foreground">Bakiye</p><p className={`font-bold ${balance > 0 ? "text-red-600" : "text-green-600"}`}>{balance > 0 ? formatCurrency(balance) : "✓"}</p></div>
									</div>
								</div>
							)
						})}
					</div>
				</TabsContent>

				{/* ─── HASTA BİLGİLERİ ─── */}
				<TabsContent value="info">
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-sm font-medium flex items-center gap-2">
									<PawPrint className="w-4 h-4 text-violet-600" />Hayvan Bilgileri
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2.5">
								{[
									{ label: "Hasta No",      value: pet.patientNumber },
									{ label: "Tür",           value: pet.species },
									{ label: "Irk",           value: pet.breed },
									{ label: "Cinsiyet",      value: pet.gender },
									{ label: "Yaş",           value: pet.age ? `${pet.age} yıl` : null },
									{ label: "Doğum Tarihi",  value: pet.dateOfBirth ? format(new Date(pet.dateOfBirth), "d MMMM yyyy", { locale: tr }) : null },
									{ label: "Ağırlık",       value: pet.weight ? `${pet.weight} kg` : null },
									{ label: "Renk",          value: pet.color },
								].filter(r => r.value).map(row => (
									<div key={row.label} className="flex justify-between items-center py-1 border-b border-muted last:border-0">
										<span className="text-sm text-muted-foreground">{row.label}</span>
										<span className="text-sm font-medium">{row.value}</span>
									</div>
								))}
							</CardContent>
						</Card>

						{pet.owner && (
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-sm font-medium flex items-center gap-2">
										<User className="w-4 h-4 text-blue-600" />Sahip Bilgileri
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2.5">
									{[
										{ label: "Ad Soyad", value: pet.owner.name },
										{ label: "E-posta",  value: pet.owner.email },
										{ label: "Telefon",  value: pet.owner.phone },
									].filter(r => r.value).map(row => (
										<div key={row.label} className="flex justify-between items-center py-1 border-b border-muted last:border-0">
											<span className="text-sm text-muted-foreground">{row.label}</span>
											<span className="text-sm font-medium">{row.value}</span>
										</div>
									))}
								</CardContent>
							</Card>
						)}

						{pet.notes && (
							<Card className="md:col-span-2">
								<CardHeader className="pb-3">
									<CardTitle className="text-sm font-medium flex items-center gap-2">
										<FileText className="w-4 h-4" />Notlar
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm whitespace-pre-wrap">{pet.notes}</p>
								</CardContent>
							</Card>
						)}
					</div>

					<p className="text-xs text-muted-foreground mt-4">
						Kayıt: {format(new Date(pet.createdAt), "d MMMM yyyy HH:mm", { locale: tr })}
					</p>
				</TabsContent>
			</Tabs>

			{/* ── Yeni Muayene Dialog ── */}
			<Dialog open={showNewVisit} onOpenChange={setShowNewVisit}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Stethoscope className="w-5 h-5 text-violet-600" />
							Yeni Muayene — {pet.name}
						</DialogTitle>
					</DialogHeader>
					<VisitForm
						defaultPetId={pet.id}
						defaultPetLabel={`${pet.name} • ${pet.species}${pet.breed ? " • " + pet.breed : ""}${pet.owner ? " / " + (pet.owner.name || pet.owner.email) : ""}`}
						onSuccess={() => { setShowNewVisit(false); refetchVisits() }}
						onCancel={() => setShowNewVisit(false)}
					/>
				</DialogContent>
			</Dialog>

			{/* ── Muayene Detay Dialog ── */}
			{openVisit && (
				<Dialog open={!!openVisitId} onOpenChange={() => setOpenVisitId(null)}>
					<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								<Activity className="w-5 h-5 text-violet-600" />
								Muayene Detayı — PRO-{openVisit.protocolNumber}
							</DialogTitle>
						</DialogHeader>
						<VisitDetail
							visit={openVisit}
							onUpdate={() => refetchVisits()}
						/>
					</DialogContent>
				</Dialog>
			)}
		</div>
	)
}

function EmptyState({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
	return (
		<div className="rounded-2xl border border-dashed p-12 text-center">
			<div className="w-12 h-12 rounded-2xl bg-muted mx-auto flex items-center justify-center mb-3">
				<Icon className="w-6 h-6 text-muted-foreground" />
			</div>
			<p className="font-medium text-sm">{title}</p>
			<p className="text-xs text-muted-foreground mt-1">{desc}</p>
		</div>
	)
}
