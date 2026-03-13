"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import {
	CheckCircle2, Clock, PlayCircle, XCircle, SkipForward,
	ChevronDown, ChevronUp, Edit2, Trash2, MessageSquare, User
} from "lucide-react"
import {
	useUpdateOrder, useDeleteOrder,
	type VetOrder, type OrderStatus,
	ORDER_TYPE_LABELS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ORDER_PRIORITY_COLORS,
} from "@/lib/react-query/hooks/orders"
import { OrderForm } from "./OrderForm"
import { toast } from "sonner"
import { useCurrency } from "@/components/providers/CurrencyProvider"

interface OrderCardProps {
	order:        VetOrder
	showPet?:     boolean
	showVisit?:   boolean
	canEdit?:     boolean
}

export function OrderCard({ order, showPet = false, showVisit = false, canEdit = true }: OrderCardProps) {
	const { formatCurrency } = useCurrency()
	const { mutateAsync: updateOrder } = useUpdateOrder()
	const { mutateAsync: deleteOrder } = useDeleteOrder()

	const [expanded,    setExpanded]    = useState(false)
	const [showEdit,    setShowEdit]    = useState(false)
	const [showNote,    setShowNote]    = useState(false)
	const [note,        setNote]        = useState("")
	const [isUpdating,  setIsUpdating]  = useState(false)

	const priorityClass = ORDER_PRIORITY_COLORS[order.priority]

	const changeStatus = async (status: OrderStatus, autoNote?: string) => {
		setIsUpdating(true)
		try {
			await updateOrder({ id: order.id, status, note: autoNote })
			toast.success(`Order: ${ORDER_STATUS_LABELS[status]}`)
		} catch {
			toast.error("Durum değiştirilemedi")
		} finally {
			setIsUpdating(false) }
	}

	const addNote = async () => {
		if (!note.trim()) return
		setIsUpdating(true)
		try {
			await updateOrder({ id: order.id, note })
			setNote(""); setShowNote(false)
			toast.success("Not eklendi")
		} catch {
			toast.error("Not eklenemedi")
		} finally { setIsUpdating(false) }
	}

	const handleDelete = async () => {
		if (!confirm("Bu order silinsin mi?")) return
		try {
			await deleteOrder(order.id)
			toast.success("Order silindi")
		} catch (e: any) {
			toast.error(e?.info?.error || "Silinemedi")
		}
	}

	const isPending     = order.status === "PENDING"
	const isInProgress  = order.status === "IN_PROGRESS"
	const isActive      = isPending || isInProgress
	const isCompleted   = order.status === "COMPLETED"
	const isCancelledOrSkipped = order.status === "CANCELLED" || order.status === "SKIPPED"

	return (
		<>
		<div className={`border-l-4 rounded-xl bg-card shadow-sm transition-all ${priorityClass} ${isCancelledOrSkipped ? "opacity-60" : ""}`}>
			{/* Başlık satırı */}
			<div className="p-4 flex items-start justify-between gap-3">
				<div className="flex items-start gap-3 flex-1 min-w-0">
					{/* Hızlı tamamla butonu */}
					<button
						type="button"
						disabled={isUpdating || !canEdit || isCancelledOrSkipped}
						onClick={() => isCompleted ? changeStatus("PENDING") : changeStatus("COMPLETED")}
						className={`mt-0.5 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
							${isCompleted
								? "bg-green-500 border-green-500 text-white"
								: "border-gray-300 hover:border-green-400 hover:bg-green-50"
							} ${!canEdit || isCancelledOrSkipped ? "cursor-not-allowed" : "cursor-pointer"}`}
					>
						{isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
					</button>

					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 flex-wrap">
							<span className="text-xs text-muted-foreground">{ORDER_TYPE_LABELS[order.type]}</span>
							<Badge className={`text-xs px-1.5 py-0 ${ORDER_STATUS_COLORS[order.status]}`}>
								{ORDER_STATUS_LABELS[order.status]}
							</Badge>
							{order.priority === "URGENT" && <Badge className="text-xs px-1.5 py-0 bg-red-100 text-red-800 animate-pulse">🔴 ACİL</Badge>}
							{order.priority === "HIGH"   && <Badge className="text-xs px-1.5 py-0 bg-orange-100 text-orange-800">🟠 Yüksek</Badge>}
						</div>

						<p className={`font-semibold mt-0.5 ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
							{order.title}
						</p>

						<div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
							{showPet && (
								<span className="flex items-center gap-1">
									🐾 {order.pet.name} ({order.pet.species})
									{order.pet.owner?.name && ` · ${order.pet.owner.name}`}
								</span>
							)}
							{showVisit && (
								<span>📋 PRO-{order.visit.protocolNumber}</span>
							)}
							{order.scheduledAt && (
								<span className="flex items-center gap-1">
									<Clock className="w-3 h-3" />
									{format(new Date(order.scheduledAt), "d MMM HH:mm", { locale: tr })}
								</span>
							)}
							{order.assignedTo && (
								<span className="flex items-center gap-1">
									<User className="w-3 h-3" />
									{order.assignedTo.name || order.assignedTo.email}
								</span>
							)}
							{order.dose && <span>💉 {order.dose}</span>}
							{order.route && <span>· {order.route}</span>}
							{order.frequency && <span>· {order.frequency}</span>}
						</div>
					</div>
				</div>

				{/* Sağ aksiyonlar */}
				<div className="flex items-center gap-1 shrink-0">
					{isActive && canEdit && (
						<>
							{isPending && (
								<Button size="sm" variant="outline" className="h-7 px-2 text-xs text-blue-600 border-blue-200" onClick={() => changeStatus("IN_PROGRESS")} disabled={isUpdating}>
									<PlayCircle className="w-3.5 h-3.5 mr-1" />Başla
								</Button>
							)}
							<Button size="sm" variant="outline" className="h-7 px-2 text-xs text-green-600 border-green-200" onClick={() => changeStatus("COMPLETED")} disabled={isUpdating}>
								<CheckCircle2 className="w-3.5 h-3.5 mr-1" />Tamamla
							</Button>
						</>
					)}
					<button type="button" onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-muted rounded-lg">
						{expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
					</button>
				</div>
			</div>

			{/* Genişletilmiş detay */}
			{expanded && (
				<div className="border-t px-4 pb-4 pt-3 space-y-3">
					{order.description && (
						<p className="text-sm text-muted-foreground bg-muted/40 rounded-lg p-3">{order.description}</p>
					)}

					{/* İlaç detayları */}
					{order.type === "MEDICATION" && (order.dose || order.route || order.frequency || order.duration) && (
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
							{[
								["Doz",        order.dose],
								["Yol",        order.route],
								["Sıklık",     order.frequency],
								["Süre",       order.duration],
							].filter(([, v]) => v).map(([k, v]) => (
								<div key={k} className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2 text-center">
									<p className="text-xs text-muted-foreground">{k}</p>
									<p className="text-sm font-medium">{v}</p>
								</div>
							))}
						</div>
					)}

					{/* Finansal */}
					{order.chargeToVisit && order.unitPrice > 0 && (
						<p className="text-xs text-muted-foreground">
							💰 Faturaya eklenir: <strong>{formatCurrency(order.unitPrice)}</strong>
						</p>
					)}

					{/* Log geçmişi */}
					{order.logs.length > 0 && (
						<div className="space-y-1.5">
							<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Geçmiş</p>
							{order.logs.slice(0, 5).map(log => (
								<div key={log.id} className="flex items-start gap-2 text-xs">
									<span className="text-muted-foreground shrink-0">
										{format(new Date(log.createdAt), "d MMM HH:mm", { locale: tr })}
									</span>
									<span className="font-medium">{log.user.name || log.user.email}</span>
									<span className="text-muted-foreground">{log.note}</span>
								</div>
							))}
						</div>
					)}

					{/* Alt aksiyonlar */}
					<div className="flex flex-wrap gap-2 pt-1">
						{canEdit && (
							<>
								<Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setShowNote(!showNote)}>
									<MessageSquare className="w-3.5 h-3.5 mr-1" />Not Ekle
								</Button>
								{isActive && (
									<>
										<Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setShowEdit(true)}>
											<Edit2 className="w-3.5 h-3.5 mr-1" />Düzenle
										</Button>
										<Button size="sm" variant="outline" className="h-7 px-2 text-xs text-yellow-600" onClick={() => changeStatus("SKIPPED")} disabled={isUpdating}>
											<SkipForward className="w-3.5 h-3.5 mr-1" />Atla
										</Button>
										<Button size="sm" variant="outline" className="h-7 px-2 text-xs text-red-600" onClick={() => changeStatus("CANCELLED")} disabled={isUpdating}>
											<XCircle className="w-3.5 h-3.5 mr-1" />İptal
										</Button>
									</>
								)}
								{!isCompleted && (
									<Button size="sm" variant="outline" className="h-7 px-2 text-xs text-red-700" onClick={handleDelete}>
										<Trash2 className="w-3.5 h-3.5 mr-1" />Sil
									</Button>
								)}
							</>
						)}
					</div>

					{/* Not input */}
					{showNote && (
						<div className="flex gap-2">
							<Textarea
								className="text-sm h-16"
								placeholder="Uygulama notu (doz değişikliği, hayvan tepkisi...)"
								value={note}
								onChange={e => setNote(e.target.value)}
							/>
							<div className="flex flex-col gap-1">
								<Button size="sm" onClick={addNote} disabled={isUpdating || !note.trim()} className="h-8 bg-violet-600 hover:bg-violet-700">Ekle</Button>
								<Button size="sm" variant="outline" onClick={() => { setShowNote(false); setNote("") }} className="h-8">İptal</Button>
							</div>
						</div>
					)}
				</div>
			)}
		</div>

		{/* Düzenleme dialog */}
		<Dialog open={showEdit} onOpenChange={setShowEdit}>
			<DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
				<DialogHeader><DialogTitle>Order Düzenle</DialogTitle></DialogHeader>
				<OrderForm
					visitId={order.visitId}
					petId={order.petId}
					order={order}
					onSuccess={() => setShowEdit(false)}
					onCancel={() => setShowEdit(false)}
				/>
			</DialogContent>
		</Dialog>
		</>
	)
}
