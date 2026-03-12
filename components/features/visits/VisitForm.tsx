"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCreateVisit } from "@/lib/react-query/hooks/visits"
import { toast } from "sonner"
import { useState, useCallback } from "react"
import { fetcher } from "@/lib/react-query/fetcher"
import { useQuery } from "@tanstack/react-query"
import { currentUserClient } from "@/lib/auth/client"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { SearchSelect, type SearchSelectOption } from "@/components/ui/search-select"

interface VisitFormProps {
	onSuccess: () => void
	onCancel: () => void
	defaultPetId?: string
	defaultAppointmentId?: string
}

export function VisitForm({
	onSuccess,
	onCancel,
	defaultPetId = "",
	defaultAppointmentId = "",
}: VisitFormProps) {
	const currentUser = currentUserClient()
	const isStaffOrAdmin = currentUser && (currentUser.isAdmin || currentUser.isSuperAdmin || currentUser.isStaff)
	// For customers, owner is always themselves
	const [ownerId, setOwnerId] = useState(isStaffOrAdmin ? "" : currentUser?.id || "")
	const [ownerSearch, setOwnerSearch] = useState("")
	const [petSearch, setPetSearch] = useState("")
	const [petId, setPetId] = useState(defaultPetId)
	const [appointmentId, setAppointmentId] = useState(defaultAppointmentId)
	const [staffId, setStaffId] = useState("")
	const [visitDate, setVisitDate] = useState(
		new Date().toISOString().slice(0, 16)
	)
	const [notes, setNotes] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)

	const { mutate: createVisit } = useCreateVisit()

	// Search owners (customers) by name, email, or phone
	const { data: ownersData, isLoading: ownersLoading } = useQuery({
		queryKey: ["admin", "owners", ownerSearch],
		queryFn: () =>
			fetcher<{ users: any[] }>(
				`/api/v1/admin/users?role=CUSTOMER&search=${encodeURIComponent(ownerSearch)}&limit=50`
			),
		enabled: isStaffOrAdmin,
	})

	// Fetch pets for selected owner (or current user if customer), with optional search
	const effectiveOwnerId = ownerId || (currentUser?.isCustomer ? currentUser.id : "")
	const { data: petsData, isLoading: petsLoading } = useQuery({
		queryKey: ["pets", "by-owner", effectiveOwnerId, petSearch],
		queryFn: () => {
			const params = new URLSearchParams()
			params.set("ownerId", effectiveOwnerId)
			params.set("limit", "100")
			if (petSearch) params.set("search", petSearch)
			return fetcher<{ pets: any[] }>(`/api/v1/pets?${params.toString()}`)
		},
		enabled: !!effectiveOwnerId,
	})

	const { data: staffData } = useQuery({
		queryKey: ["admin", "staff"],
		queryFn: () => fetcher<{ users: any[] }>("/api/v1/admin/users?limit=100"),
		enabled: currentUser ? (currentUser.isAdmin || currentUser.isSuperAdmin || currentUser.isStaff) : false,
	})

	const owners = ownersData?.users || []
	const pets = petsData?.pets || []
	const staff = staffData?.users?.filter((u: any) => ["STAFF", "ADMIN", "SUPER_ADMIN"].includes(u.role)) || []

	const ownerOptions: SearchSelectOption[] = owners.map((u: any) => ({
		value: u.id,
		label: u.name || u.email || "Bilinmiyor",
		subLabel: u.phone ? `${u.email} • ${u.phone}` : u.email,
	}))

	const petOptions: SearchSelectOption[] = pets.map((pet: any) => ({
		value: pet.id,
		label: `${pet.patientNumber || pet.name} - ${pet.name}`,
		subLabel: pet.species,
	}))

	const handleOwnerChange = useCallback((id: string) => {
		setOwnerId(id)
		setPetId("")
	}, [])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)
		try {
			await createVisit({
				petId,
				appointmentId: appointmentId || undefined,
				staffId: staffId || undefined,
				visitDate: new Date(visitDate).toISOString(),
				notes: notes || undefined,
			})
			toast.success("Muayene kaydı oluşturuldu. Protokol numarası atandı.")
			onSuccess()
		} catch (error: any) {
			toast.error(error?.info?.error || "Ziyaret oluşturulamadı")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid gap-4 md:grid-cols-2">
				{/* Step 1: Search & Select Owner */}
				{(currentUser?.isAdmin || currentUser?.isSuperAdmin || currentUser?.isStaff) && (
					<div className="space-y-2 md:col-span-2">
						<Label htmlFor="ownerId">Hasta Sahibi *</Label>
						<SearchSelect
							options={ownerOptions}
							value={ownerId}
							onValueChange={handleOwnerChange}
							placeholder="İsim, e-posta veya telefon ile ara..."
							searchPlaceholder="İsim, e-posta veya telefon ile ara..."
							emptyText="Sahip bulunamadı."
							onSearchChange={setOwnerSearch}
							loading={ownersLoading}
							renderOption={(opt) => (
								<>
									<span className="font-medium">{opt.label}</span>
									{opt.subLabel && (
										<span className="ml-2 text-muted-foreground text-xs">{opt.subLabel}</span>
									)}
								</>
							)}
						/>
					</div>
				)}

				{/* Step 2: Search & Select Pet (only when owner selected) */}
				<div className="space-y-2">
					<Label htmlFor="petId">Hayvan *</Label>
					{isStaffOrAdmin ? (
						effectiveOwnerId ? (
							<SearchSelect
								options={petOptions}
								value={petId}
								onValueChange={setPetId}
								placeholder="Hayvan adı, ırk veya tür ile ara..."
								searchPlaceholder="Hayvan adı, ırk veya tür ile ara..."
								emptyText={pets.length === 0 ? "Bu sahibin kayıtlı hayvanı yok." : "Hayvan bulunamadı."}
								onSearchChange={setPetSearch}
								loading={petsLoading}
								renderOption={(opt) => (
									<>
										<span>{opt.label}</span>
										{opt.subLabel && (
											<span className="ml-2 text-muted-foreground text-xs">({opt.subLabel})</span>
										)}
									</>
								)}
							/>
						) : (
							<Input
								disabled
								placeholder="Önce yukarıdan sahip seçin"
								className="bg-muted"
							/>
						)
					) : (
						<SearchSelect
							options={petOptions}
							value={petId}
							onValueChange={setPetId}
							placeholder="Hayvanınızı seçin..."
							searchPlaceholder="Hayvan ara..."
							emptyText={pets.length === 0 ? "Kayıtlı hayvanınız yok." : "Hayvan bulunamadı."}
							renderOption={(opt) => (
								<>
									<span>{opt.label}</span>
									{opt.subLabel && (
										<span className="ml-2 text-muted-foreground text-xs">({opt.subLabel})</span>
									)}
								</>
							)}
						/>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="visitDate">Muayene Tarihi ve Saati *</Label>
					<DateTimePicker
						id="visitDate"
						value={visitDate}
						onChange={setVisitDate}
						placeholder="Tarih ve saat seçin"
					/>
				</div>

				{(currentUser?.isAdmin || currentUser?.isSuperAdmin || currentUser?.isStaff) && (
					<div className="space-y-2">
						<Label htmlFor="staffId">Veteriner / Personel</Label>
						<Select value={staffId} onValueChange={setStaffId}>
							<SelectTrigger id="staffId">
								<SelectValue placeholder="Personel seçin (opsiyonel)" />
							</SelectTrigger>
							<SelectContent>
								{staff.map((s: any) => (
									<SelectItem key={s.id} value={s.id}>
										{s.name || s.email}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				<div className="space-y-2 md:col-span-2">
					<Label htmlFor="notes">Notlar</Label>
					<Textarea
						id="notes"
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						placeholder="Muayene notları..."
						rows={2}
					/>
				</div>
			</div>

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting || !petId}>
					{isSubmitting ? "Oluşturuluyor..." : "Muayene Oluştur"}
				</Button>
			</div>
		</form>
	)
}
