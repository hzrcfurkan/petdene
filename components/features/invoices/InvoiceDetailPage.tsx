"use client"

import { useParams, useRouter } from "next/navigation"
import { DetailShell } from "@/components/layout/detail-shell"
import { InvoiceDetail } from "@/components/features/invoices/InvoiceDetail"
import { useInvoice } from "@/lib/react-query/hooks/invoices"
import { CardSkeleton } from "@/components/skeletons"
import { Button } from "@/components/ui/button"
import { generateInvoicePDF } from "@/lib/utils/invoice-pdf"
import { Download } from "lucide-react"
import { useCurrency } from "@/components/providers/CurrencyProvider"

export interface InvoiceDetailPageProps {
	listHref: string
	listLabel: string
}

export function InvoiceDetailPage({ listHref, listLabel }: InvoiceDetailPageProps) {
	const { formatCurrency, currency } = useCurrency()
	const params = useParams()
	const id = params?.id as string
	const router = useRouter()
	const { data: invoice, isLoading, error } = useInvoice(id)

	if (isLoading) {
		return (
			<DetailShell listHref={listHref} listLabel={listLabel} pageTitle="Loading…">
				<CardSkeleton />
			</DetailShell>
		)
	}

	if (error || !invoice) {
		return (
			<DetailShell listHref={listHref} listLabel={listLabel} pageTitle="Invoice not found">
				<div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
					<p className="text-destructive font-medium">This invoice could not be loaded.</p>
					<button
						type="button"
						onClick={() => router.push(listHref)}
						className="mt-2 text-sm text-primary hover:underline"
					>
						Back to {listLabel}
					</button>
				</div>
			</DetailShell>
		)
	}

	const pageTitle = `Invoice #${invoice.id.slice(0, 8)}`
	const actions = (
		<Button
			variant="outline"
			size="sm"
			onClick={() => generateInvoicePDF(invoice, currency)}
			className="gap-2"
		>
			<Download className="h-4 w-4" />
			Download PDF
		</Button>
	)

	return (
		<DetailShell
			listHref={listHref}
			listLabel={listLabel}
			pageTitle={pageTitle}
			subtitle={`${formatCurrency(invoice.amount)} • ${invoice.status}`}
			actions={actions}
		>
			<InvoiceDetail invoice={invoice} />
		</DetailShell>
	)
}
