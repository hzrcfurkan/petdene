"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mutationFetcher } from "@/lib/react-query/fetcher"
import { fetcher } from "@/lib/react-query/fetcher"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
	Search, ChevronRight, ChevronLeft, Check,
	User, PawPrint, ClipboardCheck, Phone, Mail, Plus
} from "lucide-react"

interface HastaKayitFormProps {
	onSuccess: () => void
	onCancel:  () => void
}

const TURLER  = ["Köpek", "Kedi", "Kuş", "Tavşan", "Hamster", "Balık", "Diğer"]
const CINSLER = ["Erkek", "Dişi"]

export function HastaKayitForm({ onSuccess, onCancel }: HastaKayitFormProps) {
	const qc = useQueryClient()
	const [step, setStep]             = useState(1)
	const [isSubmitting, setIsSubmitting] = useState(false)

	// ── Adım 1: Sahip ──────────────────────────────────────────
	const [ownerMode, setOwnerMode]       = useState<"search" | "new">("search")
	const [ownerSearch, setOwnerSearch]   = useState("")
	const [ownerResults, setOwnerResults] = useState<any[]>([])
	const [searching, setSearching]       = useState(false)
	const [selectedOwner, setSelectedOwner] = useState<any | null>(null)

	// Yeni sahip alanları
	const [ownerName,  setOwnerName]  = useState("")
	const [ownerEmail, setOwnerEmail] = useState("")
	const [ownerPhone, setOwnerPhone] = useState("")

	// ── Adım 2: Hayvan ─────────────────────────────────────────
	const [petName,    setPetName]    = useState("")
	const [petSpecies, setPetSpecies] = useState("")
	const [petBreed,   setPetBreed]   = useState("")
	const [petGender,  setPetGender]  = useState("")
	const [petDob,     setPetDob]     = useState("")
	const [petWeight,  setPetWeight]  = useState("")
	const [petNotes,   setPetNotes]   = useState("")

	// Sahip arama
	const handleSearch = async () => {
		if (!ownerSearch.trim()) return
		setSearching(true)
		try {
			const res = await fetcher<{ users: any[] }>(
				`/api/v1/admin/users?role=CUSTOMER&search=${encodeURIComponent(ownerSearch)}&limit=20`
			)
			setOwnerResults(res.users || [])
		} catch { setOwnerResults([]) }
		finally { setSearching(false) }
	}

	const handleSubmit = async () => {
		setIsSubmitting(true)
		try {
			let ownerId: string

			if (ownerMode === "new") {
				// 1. Yeni sahip oluştur
				if (!ownerName.trim() || !ownerEmail.trim()) {
					toast.error("Ad ve e-posta zorunludur"); return
				}
				const newUser = await mutationFetcher<any>("/api/v1/admin/users", {
					method: "POST",
					body: { name: ownerName, email: ownerEmail, phone: ownerPhone || undefined, role: "CUSTOMER" },
				})
				ownerId = newUser.id
			} else {
				if (!selectedOwner) { toast.error("Sahip seçmelisiniz"); return }
				ownerId = selectedOwner.id
			}

			// 2. Hayvan oluştur
			if (!petName.trim() || !petSpecies) {
				toast.error("Hayvan adı ve tür zorunludur"); return
			}
			await mutationFetcher<any>("/api/v1/pets", {
				method: "POST",
				body: {
					name:        petName,
					species:     petSpecies,
					breed:       petBreed   || undefined,
					gender:      petGender  || undefined,
					dateOfBirth: petDob     || undefined,
					weight:      petWeight  ? parseFloat(petWeight) : undefined,
					notes:       petNotes   || undefined,
					ownerId,
				},
			})

			qc.invalidateQueries({ queryKey: ["pets"] })
			qc.invalidateQueries({ queryKey: ["admin", "owners"] })
			toast.success(`${petName} başarıyla kaydedildi!`)
			onSuccess()
		} catch (err: any) {
			toast.error(err?.info?.error || "Kayıt oluşturulamadı")
		} finally {
			setIsSubmitting(false)
		}
	}

	const steps = [
		{ num: 1, label: "Sahip",   icon: User },
		{ num: 2, label: "Hayvan",  icon: PawPrint },
		{ num: 3, label: "Özet",    icon: ClipboardCheck },
	]

	const ownerLabel = ownerMode === "new"
		? (ownerName || "Yeni sahip")
		: (selectedOwner?.name || selectedOwner?.email || "")

	return (
		<div className="space-y-6">
			{/* Adım göstergesi */}
			<div className="flex items-center justify-between">
				{steps.map((s, i) => {
					const Icon = s.icon
					const isActive   = step === s.num
					const isComplete = step > s.num
					return (
						<div key={s.num} className="flex items-center flex-1">
							<div className="flex flex-col items-center gap-1">
								<div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all
									${isComplete ? "bg-green-500 text-white" :
									  isActive   ? "bg-violet-600 text-white ring-2 ring-violet-200" :
									               "bg-gray-100 text-gray-400"}`}>
									{isComplete ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
								</div>
								<span className={`text-xs font-medium ${isActive ? "text-violet-600" : isComplete ? "text-green-600" : "text-gray-400"}`}>
									{s.label}
								</span>
							</div>
							{i < steps.length - 1 && (
								<div className={`flex-1 h-0.5 mx-2 mt-[-14px] ${step > s.num ? "bg-green-400" : "bg-gray-200"}`} />
							)}
						</div>
					)
				})}
			</div>

			{/* ─── Adım 1: Sahip ─── */}
			{step === 1 && (
				<div className="space-y-4">
					{/* Mod seçici */}
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => setOwnerMode("search")}
							className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all
								${ownerMode === "search" ? "bg-violet-600 text-white border-violet-600" : "bg-white text-gray-600 border-gray-200 hover:border-violet-300"}`}
						>
							<Search className="w-4 h-4 inline mr-1.5" />Mevcut Sahip
						</button>
						<button
							type="button"
							onClick={() => setOwnerMode("new")}
							className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all
								${ownerMode === "new" ? "bg-violet-600 text-white border-violet-600" : "bg-white text-gray-600 border-gray-200 hover:border-violet-300"}`}
						>
							<Plus className="w-4 h-4 inline mr-1.5" />Yeni Sahip Ekle
						</button>
					</div>

					{/* Mevcut sahip arama */}
					{ownerMode === "search" && (
						<div className="space-y-3">
							<div className="flex gap-2">
								<div className="relative flex-1">
									<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										className="pl-9"
										placeholder="İsim, e-posta veya telefon..."
										value={ownerSearch}
										onChange={e => setOwnerSearch(e.target.value)}
										onKeyDown={e => e.key === "Enter" && handleSearch()}
										autoFocus
									/>
								</div>
								<Button type="button" onClick={handleSearch} disabled={searching} variant="outline">
									{searching ? "Aranıyor..." : "Ara"}
								</Button>
							</div>

							{ownerResults.length > 0 && (
								<div className="border rounded-xl divide-y max-h-56 overflow-y-auto">
									{ownerResults.map(u => (
										<button
											key={u.id}
											type="button"
											onClick={() => setSelectedOwner(u)}
											className={`w-full text-left px-4 py-3 hover:bg-violet-50 transition-colors
												${selectedOwner?.id === u.id ? "bg-violet-50 border-l-2 border-violet-500" : ""}`}
										>
											<p className="font-medium text-sm">{u.name || "İsimsiz"}</p>
											<div className="flex gap-3 mt-0.5">
												<span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</span>
												{u.phone && <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{u.phone}</span>}
											</div>
										</button>
									))}
								</div>
							)}
							{ownerSearch && ownerResults.length === 0 && !searching && (
								<div className="text-center py-4">
									<p className="text-sm text-muted-foreground">Sonuç bulunamadı.</p>
									<button type="button" onClick={() => setOwnerMode("new")} className="text-xs text-violet-600 hover:underline mt-1">
										Yeni sahip olarak ekle →
									</button>
								</div>
							)}
						</div>
					)}

					{/* Yeni sahip formu */}
					{ownerMode === "new" && (
						<div className="space-y-3">
							<div className="space-y-1.5">
								<Label>Ad Soyad *</Label>
								<Input placeholder="Örn: Ahmet Yılmaz" value={ownerName} onChange={e => setOwnerName(e.target.value)} autoFocus />
							</div>
							<div className="space-y-1.5">
								<Label>E-posta *</Label>
								<Input type="email" placeholder="ornek@email.com" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} />
							</div>
							<div className="space-y-1.5">
								<Label>Telefon</Label>
								<Input type="tel" placeholder="05XX XXX XX XX" value={ownerPhone} onChange={e => setOwnerPhone(e.target.value)} />
							</div>
						</div>
					)}
				</div>
			)}

			{/* ─── Adım 2: Hayvan ─── */}
			{step === 2 && (
				<div className="space-y-4">
					<div className="p-3 bg-violet-50 rounded-xl text-sm flex items-center gap-2">
						<User className="w-4 h-4 text-violet-600 shrink-0" />
						<span className="text-muted-foreground">Sahip:</span>
						<span className="font-semibold text-violet-700">{ownerLabel}</span>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div className="col-span-2 space-y-1.5">
							<Label>Hayvan Adı *</Label>
							<Input placeholder="Örn: Pamuk, Karabaş..." value={petName} onChange={e => setPetName(e.target.value)} autoFocus />
						</div>

						<div className="space-y-1.5">
							<Label>Tür *</Label>
							<Select value={petSpecies} onValueChange={setPetSpecies}>
								<SelectTrigger><SelectValue placeholder="Tür seçin" /></SelectTrigger>
								<SelectContent>
									{TURLER.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-1.5">
							<Label>Cinsiyet</Label>
							<Select value={petGender} onValueChange={setPetGender}>
								<SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
								<SelectContent>
									{CINSLER.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-1.5">
							<Label>Irk</Label>
							<Input placeholder="Örn: Golden Retriever" value={petBreed} onChange={e => setPetBreed(e.target.value)} />
						</div>

						<div className="space-y-1.5">
							<Label>Ağırlık (kg)</Label>
							<Input type="number" placeholder="Örn: 4.5" value={petWeight} onChange={e => setPetWeight(e.target.value)} />
						</div>

						<div className="col-span-2 space-y-1.5">
							<Label>Doğum Tarihi</Label>
							<DatePicker value={petDob} onChange={setPetDob} placeholder="Tarih seçin" />
						</div>

						<div className="col-span-2 space-y-1.5">
							<Label>Notlar</Label>
							<Textarea
								placeholder="Alerjiler, kronik hastalıklar, özel notlar..."
								rows={3}
								value={petNotes}
								onChange={e => setPetNotes(e.target.value)}
							/>
						</div>
					</div>
				</div>
			)}

			{/* ─── Adım 3: Özet ─── */}
			{step === 3 && (
				<div className="space-y-4">
					<div className="rounded-xl border divide-y overflow-hidden">
						<div className="p-4 bg-violet-50">
							<p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-2">Sahip Bilgileri</p>
							{ownerMode === "new" ? (
								<div className="space-y-1">
									<p className="font-semibold">{ownerName}</p>
									<p className="text-sm text-muted-foreground flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{ownerEmail}</p>
									{ownerPhone && <p className="text-sm text-muted-foreground flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{ownerPhone}</p>}
									<span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Yeni kayıt oluşturulacak</span>
								</div>
							) : (
								<div className="space-y-1">
									<p className="font-semibold">{selectedOwner?.name || "İsimsiz"}</p>
									<p className="text-sm text-muted-foreground">{selectedOwner?.email}</p>
									{selectedOwner?.phone && <p className="text-sm text-muted-foreground">{selectedOwner?.phone}</p>}
									<span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Mevcut sahip</span>
								</div>
							)}
						</div>

						<div className="p-4">
							<p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-2">Hayvan Bilgileri</p>
							<div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
								{[
									["Ad",           petName],
									["Tür",          petSpecies],
									["Irk",          petBreed],
									["Cinsiyet",     petGender],
									["Doğum Tarihi", petDob],
									["Ağırlık",      petWeight ? `${petWeight} kg` : ""],
								].filter(([, v]) => v).map(([k, v]) => (
									<div key={k} className="flex justify-between text-sm border-b border-muted pb-1">
										<span className="text-muted-foreground">{k}</span>
										<span className="font-medium">{v}</span>
									</div>
								))}
							</div>
							{petNotes && <p className="text-xs text-muted-foreground mt-2 italic">{petNotes}</p>}
						</div>
					</div>
				</div>
			)}

			{/* Butonlar */}
			<div className="flex justify-between pt-2 border-t">
				<Button type="button" variant="outline" onClick={step === 1 ? onCancel : () => setStep(step - 1)}>
					{step === 1 ? "İptal" : <><ChevronLeft className="w-4 h-4 mr-1" />Geri</>}
				</Button>

				{step < 3 ? (
					<Button
						type="button"
						onClick={() => setStep(step + 1)}
						disabled={
							(step === 1 && ownerMode === "search"  && !selectedOwner) ||
							(step === 1 && ownerMode === "new"     && (!ownerName.trim() || !ownerEmail.trim())) ||
							(step === 2 && (!petName.trim() || !petSpecies))
						}
						className="bg-violet-600 hover:bg-violet-700"
					>
						İleri <ChevronRight className="w-4 h-4 ml-1" />
					</Button>
				) : (
					<Button
						type="button"
						onClick={handleSubmit}
						disabled={isSubmitting}
						className="bg-green-600 hover:bg-green-700"
					>
						{isSubmitting ? "Kaydediliyor..." : <><Check className="w-4 h-4 mr-1" />Kaydı Tamamla</>}
					</Button>
				)}
			</div>
		</div>
	)
}
