"use client"

import { useState } from "react"
import { useStocks, useCreateStock, useUpdateStock, useDeleteStock, type StockItem } from "@/lib/react-query/hooks/stocks"
import { useCurrency } from "@/components/providers/CurrencyProvider"
import { toast } from "sonner"
import {
	Package, Plus, Search, Edit2, Trash2, AlertTriangle,
	X, Check, ChevronDown, ChevronUp, Filter
} from "lucide-react"

const CATEGORIES = ["Tümü", "İlaç", "Malzeme", "Ürün", "Diğer"]
const UNITS = ["Adet", "ml", "mg", "g", "kg", "kutu", "şişe", "ampul", "tablet", "kapsül"]

const catColors: Record<string, string> = {
	"İlaç":     "sc-cat-ilac",
	"Malzeme":  "sc-cat-malzeme",
	"Ürün":     "sc-cat-urun",
	"Diğer":    "sc-cat-diger",
}

function StockForm({ item, onClose }: { item?: StockItem | null; onClose: () => void }) {
	const { mutate: create, isPending: creating } = useCreateStock()
	const { mutate: update, isPending: updating } = useUpdateStock()
	const [form, setForm] = useState({
		name:        item?.name        || "",
		category:    item?.category    || "İlaç",
		unit:        item?.unit        || "Adet",
		quantity:    item?.quantity    ?? 0,
		minQuantity: item?.minQuantity ?? 5,
		price:       item?.price       ?? 0,
		costPrice:   item?.costPrice   ?? 0,
		description: item?.description || "",
		barcode:     item?.barcode     || "",
	})

	const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

	const handleSubmit = () => {
		if (!form.name.trim()) { toast.error("Stok adı zorunlu"); return }
		if (item) {
			update({ id: item.id, ...form }, {
				onSuccess: () => { toast.success("Stok güncellendi"); onClose() },
				onError:   () => toast.error("Güncelleme başarısız"),
			})
		} else {
			create(form, {
				onSuccess: () => { toast.success("Stok eklendi"); onClose() },
				onError:   () => toast.error("Ekleme başarısız"),
			})
		}
	}

	return (
		<div className="sc-modal-overlay" onClick={onClose}>
			<div className="sc-modal" onClick={e => e.stopPropagation()}>
				<div className="sc-modal-hd">
					<h3>{item ? "Stok Düzenle" : "Yeni Stok Ekle"}</h3>
					<button className="sc-modal-close" onClick={onClose}><X className="w-4 h-4" /></button>
				</div>
				<div className="sc-form">
					<div className="sc-form-row">
						<div className="sc-field">
							<label>Stok Adı *</label>
							<input className="sc-input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Örn: Amoksisilin 500mg" />
						</div>
						<div className="sc-field">
							<label>Kategori</label>
							<select className="sc-input" value={form.category} onChange={e => set("category", e.target.value)}>
								{CATEGORIES.filter(c => c !== "Tümü").map(c => <option key={c}>{c}</option>)}
							</select>
						</div>
					</div>
					<div className="sc-form-row">
						<div className="sc-field">
							<label>Birim</label>
							<select className="sc-input" value={form.unit} onChange={e => set("unit", e.target.value)}>
								{UNITS.map(u => <option key={u}>{u}</option>)}
							</select>
						</div>
						<div className="sc-field">
							<label>Mevcut Stok</label>
							<input className="sc-input" type="number" min="0" value={form.quantity} onChange={e => set("quantity", e.target.value)} />
						</div>
						<div className="sc-field">
							<label>Min. Uyarı Eşiği</label>
							<input className="sc-input" type="number" min="0" value={form.minQuantity} onChange={e => set("minQuantity", e.target.value)} />
						</div>
					</div>
					<div className="sc-form-row">
						<div className="sc-field">
							<label>Satış Fiyatı (₺)</label>
							<input className="sc-input" type="number" min="0" step="0.01" value={form.price} onChange={e => set("price", e.target.value)} />
						</div>
						<div className="sc-field">
							<label>Maliyet Fiyatı (₺)</label>
							<input className="sc-input" type="number" min="0" step="0.01" value={form.costPrice} onChange={e => set("costPrice", e.target.value)} />
						</div>
					</div>
					<div className="sc-form-row">
						<div className="sc-field">
							<label>Barkod</label>
							<input className="sc-input" value={form.barcode} onChange={e => set("barcode", e.target.value)} placeholder="Opsiyonel" />
						</div>
						<div className="sc-field">
							<label>Açıklama</label>
							<input className="sc-input" value={form.description} onChange={e => set("description", e.target.value)} placeholder="Opsiyonel" />
						</div>
					</div>
					<div className="sc-form-actions">
						<button className="sc-btn-ghost" onClick={onClose}>İptal</button>
						<button className="sc-btn-primary" onClick={handleSubmit} disabled={creating || updating}>
							{creating || updating ? "Kaydediliyor..." : item ? "Güncelle" : "Ekle"}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

function QuickQtyEditor({ item }: { item: StockItem }) {
	const { mutate: update } = useUpdateStock()
	const [editing, setEditing] = useState(false)
	const [val, setVal] = useState(String(item.quantity))

	const save = () => {
		const n = Number(val)
		if (isNaN(n) || n < 0) { toast.error("Geçersiz miktar"); return }
		update({ id: item.id, quantity: n }, {
			onSuccess: () => { toast.success("Miktar güncellendi"); setEditing(false) },
			onError: () => toast.error("Güncelleme başarısız"),
		})
	}

	if (!editing) return (
		<button className="sc-qty-btn" onClick={() => setEditing(true)} title="Miktarı düzenle">
			<span className={item.quantity <= item.minQuantity ? "sc-qty-low" : "sc-qty-ok"}>
				{item.quantity}
			</span>
			<Edit2 className="w-3 h-3 sc-qty-edit-icon" />
		</button>
	)

	return (
		<div className="sc-qty-edit">
			<input
				className="sc-qty-input"
				type="number"
				value={val}
				onChange={e => setVal(e.target.value)}
				onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false) }}
				autoFocus
			/>
			<button className="sc-qty-save" onClick={save}><Check className="w-3 h-3" /></button>
			<button className="sc-qty-cancel" onClick={() => setEditing(false)}><X className="w-3 h-3" /></button>
		</div>
	)
}

export function StockList() {
	const { formatCurrency } = useCurrency()
	const [search, setSearch]       = useState("")
	const [category, setCategory]   = useState("Tümü")
	const [showForm, setShowForm]   = useState(false)
	const [editItem, setEditItem]   = useState<StockItem | null>(null)
	const [sortBy, setSortBy]       = useState<"name" | "quantity" | "price">("name")
	const [sortDir, setSortDir]     = useState<"asc" | "desc">("asc")

	const { data, isLoading } = useStocks({ search, category: category !== "Tümü" ? category : undefined, limit: 200 })
	const { mutate: deleteStock } = useDeleteStock()

	const items: StockItem[] = data?.items || []
	const lowStock = items.filter(i => i.quantity <= i.minQuantity)

	const sorted = [...items].sort((a, b) => {
		let cmp = 0
		if (sortBy === "name")     cmp = a.name.localeCompare(b.name)
		if (sortBy === "quantity") cmp = a.quantity - b.quantity
		if (sortBy === "price")    cmp = a.price - b.price
		return sortDir === "asc" ? cmp : -cmp
	})

	const toggleSort = (col: typeof sortBy) => {
		if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc")
		else { setSortBy(col); setSortDir("asc") }
	}

	const handleDelete = (item: StockItem) => {
		if (!confirm(`"${item.name}" stokunu silmek istediğinizden emin misiniz?`)) return
		deleteStock(item.id, {
			onSuccess: () => toast.success("Stok silindi"),
			onError:   () => toast.error("Silme başarısız"),
		})
	}

	const SortIcon = ({ col }: { col: typeof sortBy }) => (
		sortBy === col
			? sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
			: <ChevronDown className="w-3 h-3 opacity-30" />
	)

	return (
		<div className="sc-wrap">
			{/* Header */}
			<div className="sc-hd">
				<div>
					<h1 className="sc-title"><Package className="w-6 h-6" />Stok Yönetimi</h1>
					<p className="sc-sub">{items.length} stok kalemi{lowStock.length > 0 && <> · <span className="sc-low-warn"><AlertTriangle className="w-3 h-3" />{lowStock.length} düşük stok</span></>}</p>
				</div>
				<button className="sc-btn-primary" onClick={() => { setEditItem(null); setShowForm(true) }}>
					<Plus className="w-4 h-4" />Yeni Stok Ekle
				</button>
			</div>

			{/* Düşük stok uyarısı */}
			{lowStock.length > 0 && (
				<div className="sc-alert-low">
					<AlertTriangle className="w-4 h-4 shrink-0" />
					<span>Düşük stok: {lowStock.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(", ")}</span>
				</div>
			)}

			{/* Filtreler */}
			<div className="sc-filters">
				<div className="sc-search-wrap">
					<Search className="sc-search-icon" />
					<input className="sc-search" placeholder="Stok ara..." value={search} onChange={e => setSearch(e.target.value)} />
				</div>
				<div className="sc-cat-tabs">
					{CATEGORIES.map(c => (
						<button key={c} className={`sc-cat-tab ${category === c ? "sc-cat-active" : ""}`} onClick={() => setCategory(c)}>{c}</button>
					))}
				</div>
			</div>

			{/* Masaüstü Tablo */}
			<div className="sc-table-wrap">
				<table className="sc-table">
					<thead>
						<tr>
							<th className="sc-th sc-th-sortable sc-td-name" onClick={() => toggleSort("name")}>
								<span className="sc-th-inner">Stok Adı <SortIcon col="name" /></span>
							</th>
							<th className="sc-th sc-td-cat">Kategori</th>
							<th className="sc-th sc-th-sortable sc-td-qty" onClick={() => toggleSort("quantity")}>
								<span className="sc-th-inner">Stok <SortIcon col="quantity" /></span>
							</th>
							<th className="sc-th sc-th-sortable sc-td-price" onClick={() => toggleSort("price")}>
								<span className="sc-th-inner">Satış Fiyatı <SortIcon col="price" /></span>
							</th>
							<th className="sc-th sc-td-price">Maliyet</th>
							<th className="sc-th">Açıklama</th>
							<th className="sc-th sc-th-actions">İşlemler</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr><td colSpan={7} className="sc-loading">Yükleniyor...</td></tr>
						) : sorted.length === 0 ? (
							<tr><td colSpan={7} className="sc-empty"><Package className="w-8 h-8" /><span>Stok bulunamadı</span></td></tr>
						) : sorted.map(item => (
							<tr key={item.id} className="sc-tr">
								<td className="sc-td sc-td-name">
									<span className="sc-item-name">{item.name}</span>
									{item.barcode && <span className="sc-barcode">{item.barcode}</span>}
								</td>
								<td className="sc-td sc-td-cat">
									<span className={`sc-cat-badge ${catColors[item.category] || "sc-cat-diger"}`}>{item.category}</span>
								</td>
								<td className="sc-td sc-td-qty">
									<div className="sc-qty-wrap">
										<QuickQtyEditor item={item} />
										<span className="sc-unit">{item.unit}</span>
										{item.quantity <= item.minQuantity && (
											<AlertTriangle className="w-3 h-3 text-amber-500" title="Düşük stok" />
										)}
									</div>
								</td>
								<td className="sc-td sc-td-price">{formatCurrency(item.price)}</td>
								<td className="sc-td sc-td-price">{formatCurrency(item.costPrice)}</td>
								<td className="sc-td sc-td-desc">{item.description || "—"}</td>
								<td className="sc-td sc-td-actions">
									<button className="sc-action-btn sc-edit" onClick={() => { setEditItem(item); setShowForm(true) }}>
										<Edit2 className="w-3.5 h-3.5" />
									</button>
									<button className="sc-action-btn sc-delete" onClick={() => handleDelete(item)}>
										<Trash2 className="w-3.5 h-3.5" />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Mobil Card Görünümü */}
			<div className="sc-mobile-cards">
				{isLoading ? (
					<div className="sc-loading">Yükleniyor...</div>
				) : sorted.length === 0 ? (
					<div className="sc-empty"><Package className="w-8 h-8" /><span>Stok bulunamadı</span></div>
				) : sorted.map(item => (
					<div key={item.id} className="sc-mobile-card">
						<div className="sc-mc-header">
							<div>
								<div className="sc-mc-title">{item.name}</div>
								{item.barcode && <div className="sc-mc-barcode">{item.barcode}</div>}
							</div>
							<div className="sc-mc-actions">
								<button className="sc-action-btn sc-edit" onClick={() => { setEditItem(item); setShowForm(true) }}>
									<Edit2 className="w-3.5 h-3.5" />
								</button>
								<button className="sc-action-btn sc-delete" onClick={() => handleDelete(item)}>
									<Trash2 className="w-3.5 h-3.5" />
								</button>
							</div>
						</div>
						<div className="sc-mc-grid">
							<div className="sc-mc-item">
								<span className="sc-mc-label">Kategori</span>
								<span className={`sc-cat-badge ${catColors[item.category] || "sc-cat-diger"}`} style={{width:"fit-content"}}>{item.category}</span>
							</div>
							<div className="sc-mc-item">
								<span className="sc-mc-label">Stok</span>
								<div className="sc-qty-wrap">
									<QuickQtyEditor item={item} />
									<span className="sc-unit">{item.unit}</span>
									{item.quantity <= item.minQuantity && <AlertTriangle className="w-3 h-3 text-amber-500" />}
								</div>
							</div>
							<div className="sc-mc-item">
								<span className="sc-mc-label">Satış Fiyatı</span>
								<span className="sc-mc-value-price">{formatCurrency(item.price)}</span>
							</div>
							<div className="sc-mc-item">
								<span className="sc-mc-label">Maliyet</span>
								<span className="sc-mc-value-price">{formatCurrency(item.costPrice)}</span>
							</div>
							{item.description && (
								<div className="sc-mc-item" style={{gridColumn:"1/-1"}}>
									<span className="sc-mc-label">Açıklama</span>
									<span className="sc-mc-value">{item.description}</span>
								</div>
							)}
						</div>
					</div>
				))}
			</div>

			{/* Form modal */}
			{showForm && <StockForm item={editItem} onClose={() => { setShowForm(false); setEditItem(null) }} />}
		</div>
	)
}
