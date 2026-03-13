"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Printer, Receipt, Stethoscope, Package, ClipboardList } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { useCurrency } from "@/components/providers/CurrencyProvider"

interface VisitInvoiceDetailProps {
	visit: any
}

export function VisitInvoiceDetail({ visit }: VisitInvoiceDetailProps) {
	const { formatCurrency } = useCurrency()
	const printRef = useRef<HTMLDivElement>(null)

	const services    = visit.services    || []
	const stockUsages = visit.stockUsages || []
	const orders      = (visit.orders || []).filter((o: any) => o.chargeToVisit && o.unitPrice > 0)

	const servicesTotal    = services.reduce((s: number, i: any) => s + (i.total || 0), 0)
	const stockTotal       = stockUsages.reduce((s: number, i: any) => s + (i.total || 0), 0)
	const ordersTotal      = orders.reduce((s: number, i: any) => s + (i.unitPrice || 0), 0)
	const grandTotal       = visit.totalAmount || 0
	const paid             = visit.paidAmount  || 0
	const remaining        = grandTotal - paid

	const handlePrint = () => {
		const content = printRef.current
		if (!content) return
		const w = window.open("", "_blank", "width=800,height=900")
		if (!w) return
		w.document.write(`
			<html><head><title>Fatura - PRO-${visit.protocolNumber}</title>
			<style>
				* { margin: 0; padding: 0; box-sizing: border-box; }
				body { font-family: Arial, sans-serif; font-size: 13px; color: #1a1a1a; padding: 32px; }
				.header { border-bottom: 2px solid #7c3aed; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
				.clinic-name { font-size: 22px; font-weight: 800; color: #7c3aed; }
				.clinic-sub { font-size: 11px; color: #666; margin-top: 2px; }
				.invoice-title { font-size: 18px; font-weight: 700; text-align: right; }
				.invoice-meta { font-size: 11px; color: #666; text-align: right; margin-top: 4px; }
				.patient-box { background: #f5f3ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
				.patient-row { font-size: 12px; } .patient-row span { font-weight: 600; }
				.section-title { font-size: 13px; font-weight: 700; color: #7c3aed; margin: 16px 0 8px; padding-left: 8px; border-left: 3px solid #7c3aed; }
				table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
				th { background: #f3f4f6; text-align: left; padding: 7px 10px; font-size: 11px; font-weight: 700; color: #374151; border-bottom: 2px solid #e5e7eb; }
				td { padding: 7px 10px; font-size: 12px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
				tr:last-child td { border-bottom: none; }
				.right { text-align: right; }
				.totals { margin-top: 20px; border-top: 2px solid #e5e7eb; padding-top: 12px; }
				.total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
				.total-grand { font-size: 16px; font-weight: 800; color: #7c3aed; border-top: 1px solid #ddd; margin-top: 6px; padding-top: 6px; }
				.total-remaining { color: #dc2626; font-weight: 700; }
				.total-paid { color: #16a34a; }
				.footer { margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 12px; text-align: center; font-size: 11px; color: #9ca3af; }
				.badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 600; }
				.badge-green { background: #dcfce7; color: #166534; }
				.badge-yellow { background: #fef9c3; color: #854d0e; }
				.badge-blue { background: #dbeafe; color: #1e40af; }
				.empty { color: #9ca3af; font-style: italic; padding: 8px 10px; font-size: 12px; }
			</style></head><body>
			${content.innerHTML}
			</body></html>
		`)
		w.document.close()
		setTimeout(() => { w.print(); w.close() }, 500)
	}

	const sectionEmpty = (label: string) => (
		<tr><td colSpan={4} className="empty">— {label} yok —</td></tr>
	)

	return (
		<div className="space-y-4">
			{/* Aksiyon butonları */}
			<div className="flex justify-end gap-2">
				<Button variant="outline" size="sm" onClick={handlePrint}>
					<Printer className="w-4 h-4 mr-1.5" />PDF / Yazdır
				</Button>
			</div>

			{/* Print alanı */}
			<div ref={printRef} className="space-y-5">
				{/* Başlık */}
				<div className="header flex items-start justify-between border-b-2 border-violet-600 pb-4">
					<div>
						<div className="text-xl font-extrabold text-violet-700">PetCare Kliniği</div>
						<div className="text-xs text-muted-foreground mt-0.5">Veteriner Hekimlik Hizmetleri</div>
					</div>
					<div className="text-right">
						<div className="text-lg font-bold">Hizmet Dökümü</div>
						<div className="text-xs text-muted-foreground mt-0.5">
							PRO-{visit.protocolNumber} · {format(new Date(visit.visitDate), "d MMMM yyyy", { locale: tr })}
						</div>
					</div>
				</div>

				{/* Hasta bilgisi */}
				<div className="patient-box grid grid-cols-2 gap-3 bg-violet-50 border border-violet-100 rounded-xl p-4 text-sm">
					<div><span className="text-muted-foreground">Hasta:</span> <strong>{visit.pet?.name}</strong> ({visit.pet?.species})</div>
					<div><span className="text-muted-foreground">Protokol No:</span> <strong>PRO-{visit.protocolNumber}</strong></div>
					<div><span className="text-muted-foreground">Sahip:</span> <strong>{visit.pet?.owner?.name || "—"}</strong></div>
					<div><span className="text-muted-foreground">Tarih:</span> <strong>{format(new Date(visit.visitDate), "d MMMM yyyy HH:mm", { locale: tr })}</strong></div>
					{visit.pet?.owner?.phone && <div><span className="text-muted-foreground">Telefon:</span> <strong>{visit.pet.owner.phone}</strong></div>}
					{visit.staff && <div><span className="text-muted-foreground">Veteriner:</span> <strong>{visit.staff.name}</strong></div>}
				</div>

				{/* Hizmetler */}
				<div>
					<div className="flex items-center gap-2 mb-2 text-sm font-bold text-violet-700">
						<Stethoscope className="w-4 h-4" />Hizmetler
					</div>
					<table className="w-full text-sm border border-border rounded-xl overflow-hidden">
						<thead className="bg-muted/60">
							<tr>
								<th className="text-left p-2.5 font-semibold">Hizmet</th>
								<th className="text-left p-2.5 font-semibold">Tür</th>
								<th className="text-right p-2.5 font-semibold">Adet</th>
								<th className="text-right p-2.5 font-semibold">Birim Fiyat</th>
								<th className="text-right p-2.5 font-semibold">Toplam</th>
							</tr>
						</thead>
						<tbody>
							{services.length === 0
								? <tr><td colSpan={5} className="text-center py-3 text-muted-foreground text-xs">— Hizmet yok —</td></tr>
								: services.map((s: any) => (
									<tr key={s.id} className="border-t">
										<td className="p-2.5">{s.service?.title || "—"}</td>
										<td className="p-2.5 text-muted-foreground text-xs">{s.service?.type || "—"}</td>
										<td className="p-2.5 text-right">{s.quantity}</td>
										<td className="p-2.5 text-right">{formatCurrency(s.unitPrice)}</td>
										<td className="p-2.5 text-right font-medium">{formatCurrency(s.total)}</td>
									</tr>
								))
							}
							{services.length > 0 && (
								<tr className="bg-muted/30 border-t font-semibold">
									<td colSpan={4} className="p-2.5 text-right text-xs text-muted-foreground">Hizmetler Toplamı</td>
									<td className="p-2.5 text-right">{formatCurrency(servicesTotal)}</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				{/* İlaç / Malzeme */}
				<div>
					<div className="flex items-center gap-2 mb-2 text-sm font-bold text-violet-700">
						<Package className="w-4 h-4" />İlaç / Malzeme
					</div>
					<table className="w-full text-sm border border-border rounded-xl overflow-hidden">
						<thead className="bg-muted/60">
							<tr>
								<th className="text-left p-2.5 font-semibold">İsim</th>
								<th className="text-right p-2.5 font-semibold">Miktar</th>
								<th className="text-right p-2.5 font-semibold">Birim Fiyat</th>
								<th className="text-right p-2.5 font-semibold">Toplam</th>
							</tr>
						</thead>
						<tbody>
							{stockUsages.length === 0
								? <tr><td colSpan={4} className="text-center py-3 text-muted-foreground text-xs">— İlaç/malzeme yok —</td></tr>
								: stockUsages.map((s: any) => (
									<tr key={s.id} className="border-t">
										<td className="p-2.5">{s.stockItem?.name || "—"}</td>
										<td className="p-2.5 text-right">{s.quantity} {s.stockItem?.unit}</td>
										<td className="p-2.5 text-right">{formatCurrency(s.unitPrice)}</td>
										<td className="p-2.5 text-right font-medium">{formatCurrency(s.total)}</td>
									</tr>
								))
							}
							{stockUsages.length > 0 && (
								<tr className="bg-muted/30 border-t font-semibold">
									<td colSpan={3} className="p-2.5 text-right text-xs text-muted-foreground">İlaç/Malzeme Toplamı</td>
									<td className="p-2.5 text-right">{formatCurrency(stockTotal)}</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				{/* Orderlar */}
				{orders.length > 0 && (
					<div>
						<div className="flex items-center gap-2 mb-2 text-sm font-bold text-violet-700">
							<ClipboardList className="w-4 h-4" />Orderlar
						</div>
						<table className="w-full text-sm border border-border rounded-xl overflow-hidden">
							<thead className="bg-muted/60">
								<tr>
									<th className="text-left p-2.5 font-semibold">Order</th>
									<th className="text-left p-2.5 font-semibold">Detay</th>
									<th className="text-left p-2.5 font-semibold">Durum</th>
									<th className="text-right p-2.5 font-semibold">Tutar</th>
								</tr>
							</thead>
							<tbody>
								{orders.map((o: any) => (
									<tr key={o.id} className="border-t">
										<td className="p-2.5 font-medium">{o.title}</td>
										<td className="p-2.5 text-xs text-muted-foreground">
											{[o.dose, o.route, o.frequency, o.duration].filter(Boolean).join(" · ")}
										</td>
										<td className="p-2.5">
											<Badge className={`text-xs ${o.status === "COMPLETED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
												{o.status === "COMPLETED" ? "Tamamlandı" : o.status === "SKIPPED" ? "Atlandı" : "Bekliyor"}
											</Badge>
										</td>
										<td className="p-2.5 text-right font-medium">{formatCurrency(o.unitPrice)}</td>
									</tr>
								))}
								<tr className="bg-muted/30 border-t font-semibold">
									<td colSpan={3} className="p-2.5 text-right text-xs text-muted-foreground">Orderlar Toplamı</td>
									<td className="p-2.5 text-right">{formatCurrency(ordersTotal)}</td>
								</tr>
							</tbody>
						</table>
					</div>
				)}

				{/* Genel Toplam */}
				<div className="border-t-2 border-violet-200 pt-4 space-y-2">
					<div className="flex justify-between text-sm text-muted-foreground">
						<span>Hizmetler</span><span>{formatCurrency(servicesTotal)}</span>
					</div>
					{stockTotal > 0 && (
						<div className="flex justify-between text-sm text-muted-foreground">
							<span>İlaç / Malzeme</span><span>{formatCurrency(stockTotal)}</span>
						</div>
					)}
					{ordersTotal > 0 && (
						<div className="flex justify-between text-sm text-muted-foreground">
							<span>Orderlar</span><span>{formatCurrency(ordersTotal)}</span>
						</div>
					)}
					<div className="flex justify-between text-base font-bold border-t pt-2">
						<span>Genel Toplam</span><span className="text-violet-700">{formatCurrency(grandTotal)}</span>
					</div>
					<div className="flex justify-between text-sm text-green-700 font-medium">
						<span>Ödenen</span><span>{formatCurrency(paid)}</span>
					</div>
					<div className="flex justify-between text-base font-bold text-red-600">
						<span>Kalan Borç</span><span>{formatCurrency(remaining)}</span>
					</div>
				</div>

				{/* Footer */}
				<div className="text-center text-xs text-muted-foreground border-t pt-3 mt-4">
					Bu belge {format(new Date(), "d MMMM yyyy HH:mm", { locale: tr })} tarihinde oluşturulmuştur.
				</div>
			</div>
		</div>
	)
}
