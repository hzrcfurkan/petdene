"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { useCreateVaccination } from "@/lib/react-query/hooks/vaccinations"
import { usePets } from "@/lib/react-query/hooks/pets"
import { useStocks } from "@/lib/react-query/hooks/stocks"
import { toast } from "sonner"
import { Search, ChevronRight, ChevronLeft, Check, User, PawPrint, Syringe, Calendar } from "lucide-react"

interface VaccinationPlanFormProps {
	onSuccess: () => void
	onCancel: () => void
}

export function VaccinationPlanForm({ onSuccess, onCancel }: VaccinationPlanFormProps) {
	const [step, setStep] = useState(1)
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Adım 1 - Sahip arama
	const [ownerSearch, setOwnerSearch] = useState("")
	const [selectedOwnerId, setSelectedOwnerId] = useState("")
	const [selectedOwnerName, setSelectedOwnerName] = useState("")

	// Adım 2 - Hayvan seçimi
	const [selectedPetId, setSelectedPetId] = useState("")
	const [selectedPetName, setSelectedPetName] = useState("")
	const [petSearch, setPetSearch] = useState("")

	// Adım 3 - Aşı/ilaç seçimi
	const [stockSearch, setStockSearch] = useState("")
	const [selectedStockId, setSelectedStockId] = useState("")
	const [selectedStockName, setSelectedStockName] = useState("")
	const [customVaccineName, setCustomVaccineName] = useState("")
	const [useCustomName, setUseCustomName] = useState(false)

	// Adım 4 - Tarih ve saat
	const [scheduledDate, setScheduledDate] = useState("")
	const [scheduledTime, setScheduledTime] = useState("09:00")
	const [notes, setNotes] = useState("")

	const createVaccinationMutation = useCreateVaccination()

	// Sahip araması için pets çek (owner bazlı)
	const { data: ownerPetsData, isLoading: isLoadingOwnerPets } = usePets({
		limit: 50,
		search: ownerSearch || undefined,
	})
	const allPets = ownerPetsData?.pets || []

	// Tekil sahipler listesi
	const uniqueOwners = Array.from(
		new Map(
			allPets
				.filter(p => p.owner)
				.map(p => [p.owner!.id, { id: p.owner!.id, name: p.owner!.name, email: p.owner!.email, phone: (p.owner as any)?.phone }])
		).values()
	)

	// Seçili sahibin hayvanları
	const ownerPets = allPets.filter(p => p.owner?.id === selectedOwnerId)

	// Petlerin ayrıca araması
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

	const handleSubmit = async () => {
		if (!selectedPetId || !scheduledDate) {
			toast.error("Hayvan ve tarih zorunludur")
			return
		}
		const vacName = useCustomName ? customVaccineName : selectedStockName
		if (!vacName) {
			toast.error("Aşı adı zorunludur")
			return
		}

		setIsSubmitting(true)
		try {
			await createVaccinationMutation.mutateAsync({
				petId: selectedPetId,
				vaccineName: vacName,
				dateGiven: undefined,                              // null = planlanmış kayıt
				nextDue: new Date(scheduledDate).toISOString(),   // dashboard nextDue filtresi için
				isPlanned: true,
				scheduledDate: new Date(scheduledDate).toISOString(),
				scheduledTime,
				stockItemId: useCustomName ? undefined : (selectedStockId || undefined),
				notes: notes || undefined,
			} as any)
			toast.success("Aşı planı başarıyla oluşturuldu")
			onSuccess()
		} catch (error: any) {
			toast.error(error?.info?.error || "Aşı planı oluşturulamadı")
		} finally {
			setIsSubmitting(false)
		}
	}

	const steps = [
		{ num: 1, label: "Sahip", icon: User },
		{ num: 2, label: "Hayvan", icon: PawPrint },
		{ num: 3, label: "Aşı", icon: Syringe },
		{ num: 4, label: "Tarih & Saat", icon: Calendar },
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

			{/* ─── Adım 1: Sahip Ara ─── */}
			{step === 1 && (
				<div className="space-y-4">
					<div>
						<Label className="text-base font-semibold mb-2 block">Hayvan Sahibini Ara</Label>
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
					</div>

					{isLoadingOwnerPets && <p className="text-sm text-muted-foreground text-center py-4">Aranıyor...</p>}

					{uniqueOwners.length > 0 && (
						<div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
							{uniqueOwners.map(owner => (
								<button
									key={owner.id}
									type="button"
									onClick={() => {
										setSelectedOwnerId(owner.id)
										setSelectedOwnerName(owner.name || owner.email)
									}}
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

			{/* ─── Adım 2: Hayvan Seç ─── */}
			{step === 2 && (
				<div className="space-y-4">
					<div className="p-3 bg-blue-50 rounded-lg text-sm">
						<span className="text-muted-foreground">Sahip: </span>
						<span className="font-semibold text-blue-700">{selectedOwnerName}</span>
					</div>

					<div>
						<Label className="text-base font-semibold mb-2 block">Hayvanı Seç</Label>
						<div className="relative mb-3">
							<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								className="pl-9"
								placeholder="Hayvan adı ile ara..."
								value={petSearch}
								onChange={e => setPetSearch(e.target.value)}
								autoFocus
							/>
						</div>
					</div>

					{isLoadingPets && <p className="text-sm text-muted-foreground text-center py-4">Yükleniyor...</p>}

					{filteredPets.length > 0 && (
						<div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
							{filteredPets.map(pet => (
								<button
									key={pet.id}
									type="button"
									onClick={() => {
										setSelectedPetId(pet.id)
										setSelectedPetName(pet.name)
									}}
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

			{/* ─── Adım 3: Aşı / İlaç Seç ─── */}
			{step === 3 && (
				<div className="space-y-4">
					<div className="p-3 bg-blue-50 rounded-lg text-sm">
						<span className="text-muted-foreground">Hasta: </span>
						<span className="font-semibold text-blue-700">{selectedPetName}</span>
						<span className="text-muted-foreground ml-2">({selectedOwnerName})</span>
					</div>

					<div>
						<Label className="text-base font-semibold mb-1 block">Aşı / İlaç</Label>
						<p className="text-xs text-muted-foreground mb-3">Stoktan seçin veya manuel girin</p>

						{/* Stok arama */}
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
												}}
												className={`w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors
													${selectedStockId === stock.id ? "bg-blue-50 border-l-2 border-blue-500" : ""}`}
											>
												<p className="font-medium text-sm">{stock.name}</p>
												<p className="text-xs text-muted-foreground">{stock.category} · Stok: {stock.quantity} {stock.unit}</p>
											</button>
										))}
									</div>
								)}
							</>
						)}

						{/* Manuel giriş toggle */}
						<button
							type="button"
							onClick={() => { setUseCustomName(!useCustomName); setSelectedStockId(""); setSelectedStockName("") }}
							className="text-xs text-blue-600 hover:underline"
						>
							{useCustomName ? "← Stoktan seç" : "Stokta yoksa manuel gir →"}
						</button>

						{useCustomName && (
							<Input
								className="mt-2"
								placeholder="Aşı / ilaç adını girin..."
								value={customVaccineName}
								onChange={e => setCustomVaccineName(e.target.value)}
								autoFocus
							/>
						)}
					</div>
				</div>
			)}

			{/* ─── Adım 4: Tarih ve Saat ─── */}
			{step === 4 && (
				<div className="space-y-4">
					<div className="p-3 bg-blue-50 rounded-lg text-sm space-y-1">
						<div><span className="text-muted-foreground">Hasta: </span><span className="font-semibold">{selectedPetName}</span><span className="text-muted-foreground ml-2">({selectedOwnerName})</span></div>
						<div><span className="text-muted-foreground">Aşı: </span><span className="font-semibold text-blue-700">{useCustomName ? customVaccineName : selectedStockName}</span></div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label className="font-semibold">Planlanan Tarih *</Label>
							<DatePicker
								value={scheduledDate}
								onChange={setScheduledDate}
								placeholder="Tarih seçin"
							/>
						</div>
						<div className="space-y-2">
							<Label className="font-semibold">Saat</Label>
							<Input
								type="time"
								value={scheduledTime}
								onChange={e => setScheduledTime(e.target.value)}
							/>
						</div>
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
						disabled={isSubmitting || !scheduledDate}
						className="bg-blue-600 hover:bg-blue-700"
					>
						{isSubmitting ? "Kaydediliyor..." : <><Check className="w-4 h-4 mr-1" />Planı Kaydet</>}
					</Button>
				)}
			</div>
		</div>
	)
}
