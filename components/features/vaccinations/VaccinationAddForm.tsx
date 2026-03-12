"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { useCreateVaccination } from "@/lib/react-query/hooks/vaccinations"
import { useCreateVisit } from "@/lib/react-query/hooks/visits"
import { usePets } from "@/lib/react-query/hooks/pets"
import { useStocks } from "@/lib/react-query/hooks/stocks"
import { useQueryClient } from "@tanstack/react-query"
import { mutationFetcher } from "@/lib/react-query/fetcher"
import { toast } from "sonner"
import {
	Search, ChevronRight, ChevronLeft, Check,
	User, PawPrint, Syringe, Calendar, TrendingUp
} from "lucide-react"

interface VaccinationAddFormProps {
	onSuccess: () => void
	onCancel: () => void
}

export function VaccinationAddForm({ onSuccess, onCancel }: VaccinationAddFormProps) {
	const [step, setStep] = useState(1)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const queryClient = useQueryClient()

	// Adım 1 - Sahip
	const [ownerSearch, setOwnerSearch] = useState("")
	const [selectedOwnerId, setSelectedOwnerId] = useState("")
	const [selectedOwnerName, setSelectedOwnerName] = useState("")

	// Adım 2 - Hayvan
	const [selectedPetId, setSelectedPetId] = useState("")
	const [selectedPetName, setSelectedPetName] = useState("")
	const [petSearch, setPetSearch] = useState("")

	// Adım 3 - Aşı (stoktan)
	const [stockSearch, setStockSearch] = useState("")
	const [selectedStockId, setSelectedStockId] = useState("")
	const [selectedStockName, setSelectedStockName] = useState("")
	const [selectedStockPrice, setSelectedStockPrice] = useState(0)
	const [customVaccineName, setCustomVaccineName] = useState("")
	const [useCustomName, setUseCustomName] = useState(false)
	const [manualPrice, setManualPrice] = useState("")

	// Adım 4 - Tarih + not
	const [dateGiven, setDateGiven] = useState(new Date().toISOString().split("T")[0])
	const [notes, setNotes] = useState("")

	const createVaccinationMutation = useCreateVaccination()
	const createVisitMutation = useCreateVisit()

	// Sahip araması
	const { data: ownerPetsData, isLoading: isLoadingOwnerPets } = usePets({
		limit: 50,
		search: ownerSearch || undefined,
	})
	const allPets = ownerPetsData?.pets || []
	const uniqueOwners = Array.from(
		new Map(
			allPets
				.filter(p => p.owner)
				.map(p => [p.owner!.id, {
					id: p.owner!.id,
					name: p.owner!.name,
					email: p.owner!.email,
					phone: (p.owner as any)?.phone,
				}])
		).values()
	)

	// Seçili sahibin hayvanları
	const { data: petSearchData, isLoading: isLoadingPets } = usePets({
		limit: 30,
		search: petSearch || undefined,
		ownerId: selectedOwnerId || undefined,
	})
	const filteredPets = petSearchData?.pets || []

	// Stok araması
	const { data: stockData, isLoading: isLoadingStocks } = useStocks({
		search: stockSearch || undefined,
		limit: 50,
	})
	const stocks = (stockData as any)?.items || (stockData as any)?.stocks || []
	const activeStocks = stocks.filter((s: any) => s.isActive && s.quantity > 0)

	const finalPrice = useCustomName
		? (parseFloat(manualPrice) || 0)
		: selectedStockPrice

	const finalVaccineName = useCustomName ? customVaccineName : selectedStockName

	const handleSubmit = async () => {
		if (!selectedPetId || !dateGiven || !finalVaccineName) {
			toast.error("Hayvan, aşı adı ve tarih zorunludur")
			return
		}

		setIsSubmitting(true)
		try {
			// 1. Visit oluştur (borç kaydı için)
			const visit = await createVisitMutation.mutateAsync({
				petId: selectedPetId,
				visitDate: new Date(dateGiven).toISOString(),
				notes: notes || undefined,
			})

			// 2. Stok seçildiyse visit'e stok ekle (stok düşer, borç artar)
			if (!useCustomName && selectedStockId) {
				await mutationFetcher(`/api/v1/visits/${visit.id}/stock-usages`, {
					method: "POST",
					body: {
						stockItemId: selectedStockId,
						quantity: 1,
						unitPrice: selectedStockPrice,
					},
				})
			} else if (finalPrice > 0) {
				// Manuel fiyat varsa visit totalAmount'ı güncelle
				await mutationFetcher(`/api/v1/visits/${visit.id}`, {
					method: "PATCH",
					body: { totalAmount: finalPrice },
				})
			}

			// 3. Vaccination kaydı oluştur (isPlanned=false, gerçek aşı)
			await createVaccinationMutation.mutateAsync({
				petId: selectedPetId,
				vaccineName: finalVaccineName,
				dateGiven: new Date(dateGiven).toISOString(),
				isPlanned: false,
				stockItemId: (!useCustomName && selectedStockId) ? selectedStockId : undefined,
				notes: notes || undefined,
			} as any)

			queryClient.invalidateQueries({ queryKey: ["visits"] })
			queryClient.invalidateQueries({ queryKey: ["vaccinations"] })

			toast.success(
				finalPrice > 0
					? `Aşı kaydedildi. ${finalPrice.toFixed(2)} ₺ borç yansıtıldı.`
					: "Aşı başarıyla kaydedildi."
			)
			onSuccess()
		} catch (error: any) {
			toast.error(error?.info?.error || "Aşı kaydedilemedi")
		} finally {
			setIsSubmitting(false)
		}
	}

	const steps = [
		{ num: 1, label: "Sahip",   icon: User },
		{ num: 2, label: "Hayvan",  icon: PawPrint },
		{ num: 3, label: "Aşı",    icon: Syringe },
		{ num: 4, label: "Tarih",   icon: Calendar },
	]

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
									  isActive   ? "bg-blue-600 text-white ring-2 ring-blue-200" :
									               "bg-gray-100 text-gray-400"}`}>
									{isComplete ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
								</div>
								<span className={`text-xs font-medium ${isActive ? "text-blue-600" : isComplete ? "text-green-600" : "text-gray-400"}`}>
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
					<Label className="text-base font-semibold block">Hayvan Sahibini Ara</Label>
					<div className="relative">
						<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							className="pl-9"
							placeholder="İsim, e-posta veya telefon ile ara..."
							value={ownerSearch}
							onChange={e => { setOwnerSearch(e.target.value); setSelectedOwnerId("") }}
							autoFocus
						/>
					</div>
					{isLoadingOwnerPets && <p className="text-sm text-muted-foreground text-center py-4">Aranıyor...</p>}
					{uniqueOwners.length > 0 && (
						<div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
							{uniqueOwners.map(owner => (
								<button
									key={owner.id}
									type="button"
									onClick={() => { setSelectedOwnerId(owner.id); setSelectedOwnerName(owner.name || owner.email) }}
									className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors
										${selectedOwnerId === owner.id ? "bg-blue-50 border-l-2 border-blue-500" : ""}`}
								>
									<p className="font-medium text-sm">{owner.name || "İsimsiz"}</p>
									<p className="text-xs text-muted-foreground">{owner.email}</p>
									{owner.phone && <p className="text-xs text-muted-foreground">{owner.phone}</p>}
								</button>
							))}
						</div>
					)}
					{ownerSearch && uniqueOwners.length === 0 && !isLoadingOwnerPets && (
						<p className="text-sm text-muted-foreground text-center py-4">Sonuç bulunamadı</p>
					)}
				</div>
			)}

			{/* ─── Adım 2: Hayvan ─── */}
			{step === 2 && (
				<div className="space-y-4">
					<div className="p-3 bg-blue-50 rounded-lg text-sm">
						<span className="text-muted-foreground">Sahip: </span>
						<span className="font-semibold text-blue-700">{selectedOwnerName}</span>
					</div>
					<Label className="text-base font-semibold block">Hayvanı Seç</Label>
					<div className="relative">
						<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							className="pl-9"
							placeholder="Hayvan adı ile ara..."
							value={petSearch}
							onChange={e => setPetSearch(e.target.value)}
							autoFocus
						/>
					</div>
					{isLoadingPets && <p className="text-sm text-muted-foreground text-center py-4">Yükleniyor...</p>}
					{filteredPets.length > 0 && (
						<div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
							{filteredPets.map(pet => (
								<button
									key={pet.id}
									type="button"
									onClick={() => { setSelectedPetId(pet.id); setSelectedPetName(pet.name) }}
									className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors
										${selectedPetId === pet.id ? "bg-blue-50 border-l-2 border-blue-500" : ""}`}
								>
									<p className="font-medium text-sm">{pet.name}</p>
									<p className="text-xs text-muted-foreground">{pet.species}{pet.breed ? ` · ${pet.breed}` : ""}</p>
									{(pet as any).patientNumber && <p className="text-xs text-muted-foreground">No: {(pet as any).patientNumber}</p>}
								</button>
							))}
						</div>
					)}
					{filteredPets.length === 0 && !isLoadingPets && (
						<p className="text-sm text-muted-foreground text-center py-4">
							{petSearch ? "Hayvan bulunamadı" : "Bu sahibin hayvanları yükleniyor..."}
						</p>
					)}
				</div>
			)}

			{/* ─── Adım 3: Aşı / Stok ─── */}
			{step === 3 && (
				<div className="space-y-4">
					<div className="p-3 bg-blue-50 rounded-lg text-sm">
						<span className="text-muted-foreground">Hasta: </span>
						<span className="font-semibold text-blue-700">{selectedPetName}</span>
						<span className="text-muted-foreground ml-2">({selectedOwnerName})</span>
					</div>

					<div>
						<Label className="text-base font-semibold mb-1 block">Aşı / İlaç Seç</Label>
						<p className="text-xs text-muted-foreground mb-3">Stoktan seçin → fiyat otomatik gelir ve stok düşer</p>

						{!useCustomName && (
							<>
								<div className="relative mb-3">
									<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										className="pl-9"
										placeholder="İlaç/aşı adı ara (stoktan)..."
										value={stockSearch}
										onChange={e => { setStockSearch(e.target.value); setSelectedStockId("") }}
										autoFocus
									/>
								</div>
								{isLoadingStocks && <p className="text-sm text-muted-foreground text-center py-2">Yükleniyor...</p>}
								{activeStocks.length > 0 && (
									<div className="border rounded-lg divide-y max-h-48 overflow-y-auto mb-3">
										{activeStocks
											.filter((s: any) => !stockSearch || s.name.toLowerCase().includes(stockSearch.toLowerCase()))
											.map((stock: any) => (
											<button
												key={stock.id}
												type="button"
												onClick={() => {
													setSelectedStockId(stock.id)
													setSelectedStockName(stock.name)
													setSelectedStockPrice(stock.price || 0)
												}}
												className={`w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors
													${selectedStockId === stock.id ? "bg-blue-50 border-l-2 border-blue-500" : ""}`}
											>
												<div className="flex items-center justify-between">
													<div>
														<p className="font-medium text-sm">{stock.name}</p>
														<p className="text-xs text-muted-foreground">{stock.category} · Stok: {stock.quantity} {stock.unit}</p>
													</div>
													<div className="text-right">
														<p className="font-semibold text-sm text-green-700">{stock.price?.toFixed(2)} ₺</p>
													</div>
												</div>
											</button>
										))}
									</div>
								)}
							</>
						)}

						<button
							type="button"
							onClick={() => { setUseCustomName(!useCustomName); setSelectedStockId(""); setSelectedStockName(""); setSelectedStockPrice(0) }}
							className="text-xs text-blue-600 hover:underline"
						>
							{useCustomName ? "← Stoktan seç" : "Stokta yoksa manuel gir →"}
						</button>

						{useCustomName && (
							<div className="mt-3 space-y-3">
								<Input
									placeholder="Aşı / ilaç adını girin..."
									value={customVaccineName}
									onChange={e => setCustomVaccineName(e.target.value)}
									autoFocus
								/>
								<div className="space-y-1">
									<Label className="text-sm">Fiyat (₺) <span className="text-muted-foreground font-normal">— boş bırakılırsa borç yansıtılmaz</span></Label>
									<div className="relative">
										<TrendingUp className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
										<Input
											className="pl-9"
											type="number"
											placeholder="0.00"
											value={manualPrice}
											onChange={e => setManualPrice(e.target.value)}
										/>
									</div>
								</div>
							</div>
						)}

						{/* Seçili aşı fiyat özeti */}
						{!useCustomName && selectedStockId && (
							<div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
								<div>
									<p className="font-semibold text-sm">{selectedStockName}</p>
									<p className="text-xs text-muted-foreground">Stoktan seçildi · 1 adet</p>
								</div>
								<p className="text-lg font-bold text-green-700">{selectedStockPrice.toFixed(2)} ₺</p>
							</div>
						)}
					</div>
				</div>
			)}

			{/* ─── Adım 4: Tarih + Not ─── */}
			{step === 4 && (
				<div className="space-y-4">
					<div className="p-3 bg-blue-50 rounded-lg text-sm space-y-1">
						<div>
							<span className="text-muted-foreground">Hasta: </span>
							<span className="font-semibold">{selectedPetName}</span>
							<span className="text-muted-foreground ml-2">({selectedOwnerName})</span>
						</div>
						<div>
							<span className="text-muted-foreground">Aşı: </span>
							<span className="font-semibold text-blue-700">{finalVaccineName}</span>
						</div>
						{finalPrice > 0 && (
							<div>
								<span className="text-muted-foreground">Yansıtılacak Borç: </span>
								<span className="font-bold text-green-700">{finalPrice.toFixed(2)} ₺</span>
							</div>
						)}
					</div>

					<div className="space-y-2">
						<Label className="font-semibold">Uygulama Tarihi *</Label>
						<DatePicker
							value={dateGiven}
							onChange={setDateGiven}
							placeholder="Tarih seçin"
						/>
					</div>

					<div className="space-y-2">
						<Label>Notlar</Label>
						<Textarea
							value={notes}
							onChange={e => setNotes(e.target.value)}
							placeholder="Aşı hakkında notlar..."
							rows={3}
						/>
					</div>

					{finalPrice > 0 && (
						<div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
							<p className="font-semibold text-amber-800">💰 Borç Bilgisi</p>
							<p className="text-amber-700 mt-1">
								Kaydet butonuna basıldığında <strong>{finalPrice.toFixed(2)} ₺</strong> tutarında
								ziyaret kaydı oluşturulacak ve sahibine borç olarak yansıtılacaktır.
							</p>
						</div>
					)}
				</div>
			)}

			{/* Butonlar */}
			<div className="flex justify-between pt-2 border-t">
				<Button type="button" variant="outline" onClick={step === 1 ? onCancel : () => setStep(step - 1)}>
					{step === 1 ? "İptal" : <><ChevronLeft className="w-4 h-4 mr-1" />Geri</>}
				</Button>

				{step < 4 ? (
					<Button
						type="button"
						onClick={() => setStep(step + 1)}
						disabled={
							(step === 1 && !selectedOwnerId) ||
							(step === 2 && !selectedPetId) ||
							(step === 3 && !selectedStockId && !customVaccineName)
						}
					>
						İleri <ChevronRight className="w-4 h-4 ml-1" />
					</Button>
				) : (
					<Button
						type="button"
						onClick={handleSubmit}
						disabled={isSubmitting || !dateGiven}
						className="bg-green-600 hover:bg-green-700"
					>
						{isSubmitting ? "Kaydediliyor..." : <><Check className="w-4 h-4 mr-1" />Aşıyı Kaydet</>}
					</Button>
				)}
			</div>
		</div>
	)
}
