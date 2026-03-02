"use client"

import { useState } from "react"
import {
	useVisitStockUsages, useAddVisitStockUsage, useRemoveVisitStockUsage,
	useStocks, type StockItem, type VisitStockUsage
} from "@/lib/react-query/hooks/stocks"
import { useCurrency } from "@/components/providers/CurrencyProvider"
import { toast } from "sonner"
import { Package, Plus, Trash2, X, Search, AlertTriangle } from "lucide-react"

interface VisitStockUsagesProps {
	visitId: string
	visitStatus: string
	onTotalChange?: (newTotal: number) => void
}

function AddStockModal({ visitId, onClose }: { visitId: string; onClose: () => void }) {
	const { formatCurrency } = useCurrency()
	const [search, setSearch]         = useState("")
	const [selected, setSelected]     = useState<StockItem | null>(null)
	const [quantity, setQuantity]     = useState("1")
	const [unitPrice, setUnitPrice]   = useState("")
	const [notes, setNotes]           = useState("")

	const { data }        = useStocks({ search, limit: 50 })
	const { mutate: add, isPending } = useAddVisitStockUsage(visitId)
	const items: StockItem[] = data?.items || []

	const handleSelect = (item: StockItem) => {
		setSelected(item)
		setUnitPrice(String(item.price))
	}

	const handleAdd = () => {
		if (!selected) { toast.error("Stok kalemi seçin"); return }
		const qty = Number(quantity)
		if (!qty || qty <= 0) { toast.error("Geçerli bir miktar girin"); return }
		if (qty > selected.quantity) { toast.error(`Yetersiz stok. Mevcut: ${selected.quantity} ${selected.unit}`); return }

		add({
			stockItemId: selected.id,
			quantity: qty,
			unitPrice: unitPrice ? Number(unitPrice) : selected.price,
			notes: notes || undefined,
		}, {
			onSuccess: () => { toast.success(`${selected.name} eklendi`); onClose() },
			onError: (e: any) => toast.error(e?.message || "Ekleme başarısız"),
		})
	}

	return (
		<div className="sc-modal-overlay" onClick={onClose}>
			<div className="sc-modal sc-modal-sm" onClick={e => e.stopPropagation()}>
				<div className="sc-modal-hd">
					<h3>İlaç / Malzeme Ekle</h3>
					<button className="sc-modal-close" onClick={onClose}><X className="w-4 h-4" /></button>
				</div>
				<div className="sc-form">
					{/* Stok arama */}
					{!selected ? (
						<>
							<div className="sc-field">
								<label>Stok Ara</label>
								<div className="sc-search-wrap">
									<Search className="sc-search-icon" />
									<input className="sc-search" placeholder="İlaç veya malzeme adı..." value={search} onChange={e => setSearch(e.target.value)} autoFocus />
								</div>
							</div>
							<div className="sc-stock-pick-list">
								{items.length === 0 ? (
									<div className="sc-empty-sm">Stok bulunamadı</div>
								) : items.map(item => (
									<button key={item.id} className="sc-stock-pick-row" onClick={() => handleSelect(item)}>
										<div className="sc-spick-left">
											<span className="sc-spick-name">{item.name}</span>
											<span className="sc-spick-cat">{item.category}</span>
										</div>
										<div className="sc-spick-right">
											<span className={item.quantity <= item.minQuantity ? "sc-qty-low" : "sc-qty-ok"}>
												{item.quantity} {item.unit}
											</span>
											<span className="sc-spick-price">{formatCurrency(item.price)}</span>
										</div>
									</button>
								))}
							</div>
						</>
					) : (
						<>
							{/* Seçili stok */}
							<div className="sc-selected-item">
								<div className="sc-si-info">
									<p className="sc-si-name">{selected.name}</p>
									<p className="sc-si-meta">{selected.category} · Mevcut: {selected.quantity} {selected.unit}</p>
								</div>
								<button className="sc-si-clear" onClick={() => setSelected(null)}><X className="w-3 h-3" /></button>
							</div>
							{selected.quantity <= selected.minQuantity && (
								<div className="sc-warn-sm"><AlertTriangle className="w-3 h-3" />Düşük stok uyarısı</div>
							)}
							<div className="sc-form-row">
								<div className="sc-field">
									<label>Miktar ({selected.unit})</label>
									<input className="sc-input" type="number" min="0.1" step="0.1" max={selected.quantity} value={quantity} onChange={e => setQuantity(e.target.value)} autoFocus />
								</div>
								<div className="sc-field">
									<label>Birim Fiyat (₺)</label>
									<input className="sc-input" type="number" min="0" step="0.01" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} />
								</div>
							</div>
							{quantity && unitPrice && (
								<div className="sc-total-preview">
									Toplam: <strong>{formatCurrency(Number(quantity) * Number(unitPrice))}</strong>
								</div>
							)}
							<div className="sc-field">
								<label>Not (opsiyonel)</label>
								<input className="sc-input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Kullanım notu..." />
							</div>
							<div className="sc-form-actions">
								<button className="sc-btn-ghost" onClick={() => setSelected(null)}>← Geri</button>
								<button className="sc-btn-primary" onClick={handleAdd} disabled={isPending}>
									{isPending ? "Ekleniyor..." : "Ekle"}
								</button>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	)
}

export function VisitStockUsages({ visitId, visitStatus }: VisitStockUsagesProps) {
	const { formatCurrency } = useCurrency()
	const [showModal, setShowModal] = useState(false)
	const { data, isLoading } = useVisitStockUsages(visitId)
	const { mutate: remove }  = useRemoveVisitStockUsage(visitId)
	const usages: VisitStockUsage[] = data?.usages || []
	const total = usages.reduce((s, u) => s + u.total, 0)
	const canEdit = visitStatus !== "Tamamlandı" && visitStatus !== "İptal Edildi"

	const handleRemove = (usage: VisitStockUsage) => {
		if (!confirm(`"${usage.stockItem.name}" kullanımını geri almak istediğinizden emin misiniz? Stok iade edilecek.`)) return
		remove(usage.id, {
			onSuccess: () => toast.success("Stok kullanımı kaldırıldı"),
			onError:   () => toast.error("Kaldırma başarısız"),
		})
	}

	return (
		<div className="vsu-wrap">
			<div className="vsu-hd">
				<div className="vsu-title-row">
					<Package className="w-4 h-4" />
					<h4>İlaç / Malzeme Kullanımı</h4>
					{usages.length > 0 && <span className="vsu-count">{usages.length}</span>}
				</div>
				{canEdit && (
					<button className="sc-btn-sm" onClick={() => setShowModal(true)}>
						<Plus className="w-3.5 h-3.5" />Ekle
					</button>
				)}
			</div>

			{isLoading ? (
				<div className="vsu-loading">Yükleniyor...</div>
			) : usages.length === 0 ? (
				<div className="vsu-empty">
					<Package className="w-6 h-6" />
					<span>Bu ziyarete henüz ilaç/malzeme eklenmedi</span>
					{canEdit && (
						<button className="sc-btn-sm" onClick={() => setShowModal(true)}>
							<Plus className="w-3.5 h-3.5" />İlk kalemi ekle
						</button>
					)}
				</div>
			) : (
				<>
					<div className="vsu-list">
						{usages.map(u => (
							<div key={u.id} className="vsu-row">
								<div className="vsu-item-info">
									<span className="vsu-item-name">{u.stockItem.name}</span>
									<span className="vsu-item-meta">
										{u.quantity} {u.stockItem.unit} × {formatCurrency(u.unitPrice)}
										{u.notes && ` · ${u.notes}`}
									</span>
								</div>
								<div className="vsu-item-right">
									<span className="vsu-item-total">{formatCurrency(u.total)}</span>
									{canEdit && (
										<button className="sc-action-btn sc-delete" onClick={() => handleRemove(u)}>
											<Trash2 className="w-3 h-3" />
										</button>
									)}
								</div>
							</div>
						))}
					</div>
					<div className="vsu-footer">
						<span>İlaç/Malzeme Toplamı</span>
						<strong>{formatCurrency(total)}</strong>
					</div>
				</>
			)}

			{showModal && <AddStockModal visitId={visitId} onClose={() => setShowModal(false)} />}
		</div>
	)
}
