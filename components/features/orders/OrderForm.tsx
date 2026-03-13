"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { useCreateOrder, useUpdateOrder, type VetOrder, type OrderType, type OrderPriority, ORDER_TYPE_LABELS, ORDER_PRIORITY_LABELS, ROUTE_OPTIONS, FREQUENCY_OPTIONS, DURATION_OPTIONS } from "@/lib/react-query/hooks/orders"
import { useQuery } from "@tanstack/react-query"
import { fetcher } from "@/lib/react-query/fetcher"
import { toast } from "sonner"

interface OrderFormProps {
	visitId:  string
	petId:    string
	order?:   VetOrder | null
	onSuccess: () => void
	onCancel:  () => void
}

const ORDER_TYPES: OrderType[] = ["MEDICATION", "PROCEDURE", "LAB", "DIET", "TASK"]
const PRIORITIES: OrderPriority[] = ["URGENT", "HIGH", "NORMAL", "LOW"]

export function OrderForm({ visitId, petId, order, onSuccess, onCancel }: OrderFormProps) {
	const { mutateAsync: createOrder } = useCreateOrder()
	const { mutateAsync: updateOrder } = useUpdateOrder()

	const [type,         setType]         = useState<OrderType>(order?.type || "MEDICATION")
	const [description,  setDescription]  = useState(order?.description || "")
	const [priority,     setPriority]     = useState<OrderPriority>(order?.priority || "NORMAL")
	const [assignedToId, setAssignedToId] = useState(order?.assignedToId || "")
	const [scheduledAt,  setScheduledAt]  = useState(order?.scheduledAt ? new Date(order.scheduledAt).toISOString().slice(0, 16) : "")
	const [stockItemId,  setStockItemId]  = useState(order?.stockItemId || "")
	const [dose,         setDose]         = useState(order?.dose || "")
	const [route,        setRoute]        = useState(order?.route || "")
	const [frequency,    setFrequency]    = useState(order?.frequency || "")
	const [duration,     setDuration]     = useState(order?.duration || "")
	const [title,        setTitle]        = useState(order?.title || "")
	const [chargeToVisit, setChargeToVisit] = useState(order?.chargeToVisit !== false)
	const [unitPrice,    setUnitPrice]    = useState(order?.unitPrice?.toString() || "0")
	const [isSubmitting, setIsSubmitting] = useState(false)

	const isMedication = type === "MEDICATION"

	const { data: stockData } = useQuery({
		queryKey: ["stocks-active"],
		queryFn:  () => fetcher<{ items: any[] }>("/api/v1/stocks?limit=500&active=true"),
	})
	const stocks = stockData?.items || []

	const { data: staffData } = useQuery({
		queryKey: ["staff-list"],
		queryFn:  () => fetcher<{ users: any[] }>("/api/v1/admin/users?limit=100"),
	})
	const staff = staffData?.users?.filter((u: any) => ["STAFF", "ADMIN", "SUPER_ADMIN"].includes(u.role)) || []

	useEffect(() => {
		if (stockItemId && stockItemId !== "__none__") {
			const item = stocks.find((s: any) => s.id === stockItemId)
			if (item && (!unitPrice || unitPrice === "0")) {
				setUnitPrice(item.price?.toString() || "0")
			}
		}
	}, [stockItemId])

	const handleSubmit = async () => {
		if (isMedication) {
			if (!stockItemId || stockItemId === "__none__") { toast.error("Stoktan ilaç seçimi zorunludur"); return }
			if (!dose.trim()) { toast.error("Doz zorunludur"); return }
			if (!route)       { toast.error("Uygulama yolu zorunludur"); return }
			if (!frequency)   { toast.error("Sıklık zorunludur"); return }
			if (!duration)    { toast.error("Süre zorunludur"); return }
		} else {
			if (!title.trim()) { toast.error("Başlık zorunludur"); return }
		}

		setIsSubmitting(true)
		try {
			const selectedStock = stocks.find((s: any) => s.id === stockItemId)
			const finalTitle = isMedication ? (selectedStock?.name || stockItemId) : title

			const data = {
				visitId, petId, type,
				title: finalTitle,
				description: description || undefined,
				priority, assignedToId: assignedToId || undefined,
				scheduledAt: scheduledAt || undefined,
				stockItemId: (stockItemId && stockItemId !== "__none__") ? stockItemId : undefined,
				dose: dose || undefined, route: route || undefined,
				frequency: frequency || undefined, duration: duration || undefined,
				chargeToVisit, unitPrice: parseFloat(unitPrice) || 0,
			}
			if (order) {
				await updateOrder({ id: order.id, ...data })
				toast.success("Order güncellendi")
			} else {
				await createOrder(data as any)
				toast.success("Order oluşturuldu")
			}
			onSuccess()
		} catch (err: any) {
			toast.error(err?.info?.error || "Order kaydedilemedi")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="space-y-5">
			{/* Tip + Öncelik */}
			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-1.5">
					<Label>Order Tipi *</Label>
					<Select value={type} onValueChange={v => setType(v as OrderType)}>
						<SelectTrigger><SelectValue /></SelectTrigger>
						<SelectContent>
							{ORDER_TYPES.map(t => <SelectItem key={t} value={t}>{ORDER_TYPE_LABELS[t]}</SelectItem>)}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-1.5">
					<Label>Öncelik</Label>
					<Select value={priority} onValueChange={v => setPriority(v as OrderPriority)}>
						<SelectTrigger><SelectValue /></SelectTrigger>
						<SelectContent>
							{PRIORITIES.map(p => <SelectItem key={p} value={p}>{ORDER_PRIORITY_LABELS[p]}</SelectItem>)}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* İlaç olmayan tipler için başlık */}
			{!isMedication && (
				<div className="space-y-1.5">
					<Label>Başlık *</Label>
					<Input placeholder="Order başlığı..." value={title} onChange={e => setTitle(e.target.value)} autoFocus />
				</div>
			)}

			{/* İlaç detayları */}
			{isMedication && (
				<div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100">
					<p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">İlaç Detayları</p>
					<div className="space-y-1.5">
						<Label>Stoktan Seç <span className="text-red-500">*</span></Label>
						<Select value={stockItemId} onValueChange={v => setStockItemId(v === "__none__" ? "" : v)}>
							<SelectTrigger className={!stockItemId ? "border-red-200" : ""}>
								<SelectValue placeholder="İlaç seçin..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="__none__">— Seçin —</SelectItem>
								{stocks.map((s: any) => (
									<SelectItem key={s.id} value={s.id}>
										{s.name} ({s.unit}) — {s.quantity} adet
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<Label>Doz <span className="text-red-500">*</span></Label>
							<Input placeholder="Örn: 10 mg/kg, 5 ml" value={dose} onChange={e => setDose(e.target.value)} className={!dose ? "border-red-200" : ""} />
						</div>
						<div className="space-y-1.5">
							<Label>Uygulama Yolu <span className="text-red-500">*</span></Label>
							<Select value={route} onValueChange={setRoute}>
								<SelectTrigger className={!route ? "border-red-200" : ""}><SelectValue placeholder="Seçin" /></SelectTrigger>
								<SelectContent>{ROUTE_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
							</Select>
						</div>
						<div className="space-y-1.5">
							<Label>Sıklık <span className="text-red-500">*</span></Label>
							<Select value={frequency} onValueChange={setFrequency}>
								<SelectTrigger className={!frequency ? "border-red-200" : ""}><SelectValue placeholder="Seçin" /></SelectTrigger>
								<SelectContent>{FREQUENCY_OPTIONS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
							</Select>
						</div>
						<div className="space-y-1.5">
							<Label>Süre <span className="text-red-500">*</span></Label>
							<Select value={duration} onValueChange={setDuration}>
								<SelectTrigger className={!duration ? "border-red-200" : ""}><SelectValue placeholder="Seçin" /></SelectTrigger>
								<SelectContent>{DURATION_OPTIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
							</Select>
						</div>
					</div>
				</div>
			)}

			{/* Açıklama */}
			<div className="space-y-1.5">
				<Label>Açıklama / Not</Label>
				<Textarea placeholder="Detaylı talimatlar, özel notlar..." rows={3} value={description} onChange={e => setDescription(e.target.value)} />
			</div>

			{/* Zamanlama + Atama */}
			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-1.5">
					<Label>Planlanmış Zaman</Label>
					<DateTimePicker value={scheduledAt} onChange={setScheduledAt} placeholder="Zaman seçin (opsiyonel)" />
				</div>
				<div className="space-y-1.5">
					<Label>Atanan Personel</Label>
					<Select value={assignedToId} onValueChange={v => setAssignedToId(v === "__none__" ? "" : v)}>
						<SelectTrigger><SelectValue placeholder="— Herhangi biri —" /></SelectTrigger>
						<SelectContent>
							<SelectItem value="__none__">— Herhangi biri —</SelectItem>
							{staff.map((s: any) => (<SelectItem key={s.id} value={s.id}>{s.name || s.email}</SelectItem>))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Finansal */}
			<div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
				<div className="flex items-center gap-3">
					<Switch checked={chargeToVisit} onCheckedChange={setChargeToVisit} />
					<Label className="cursor-pointer">Faturaya ekle</Label>
				</div>
				{chargeToVisit && (
					<div className="flex items-center gap-2">
						<Label className="text-sm text-muted-foreground">Tutar (₺)</Label>
						<Input type="number" className="w-24 h-8 text-right" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} />
					</div>
				)}
			</div>

			{/* Butonlar */}
			<div className="flex justify-end gap-2 pt-2 border-t">
				<Button variant="outline" onClick={onCancel} disabled={isSubmitting}>İptal</Button>
				<Button onClick={handleSubmit} disabled={isSubmitting} className="bg-violet-600 hover:bg-violet-700">
					{isSubmitting ? "Kaydediliyor..." : order ? "Güncelle" : "Order Oluştur"}
				</Button>
			</div>
		</div>
	)
}
