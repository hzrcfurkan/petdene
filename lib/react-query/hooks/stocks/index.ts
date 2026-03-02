"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetcher, mutationFetcher } from "../../fetcher"

export interface StockItem {
	id: string
	name: string
	category: string
	unit: string
	quantity: number
	minQuantity: number
	price: number
	costPrice: number
	description?: string | null
	barcode?: string | null
	isActive: boolean
	createdAt: string
	updatedAt: string
}

export interface VisitStockUsage {
	id: string
	visitId: string
	stockItemId: string
	quantity: number
	unitPrice: number
	total: number
	notes?: string | null
	createdAt: string
	stockItem: StockItem
}

// Stok listesi
export function useStocks(params?: { search?: string; category?: string; limit?: number }) {
	const query = new URLSearchParams()
	if (params?.search)   query.set("search", params.search)
	if (params?.category) query.set("category", params.category)
	if (params?.limit)    query.set("limit", String(params.limit))

	return useQuery({
		queryKey: ["stocks", params],
		queryFn: () => fetcher(`/api/v1/stocks?${query.toString()}`),
	})
}

// Stok ekle
export function useCreateStock() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (data: Partial<StockItem>) =>
			mutationFetcher("/api/v1/stocks", { method: "POST", body: data }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["stocks"] }),
	})
}

// Stok güncelle
export function useUpdateStock() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ id, ...data }: Partial<StockItem> & { id: string }) =>
			mutationFetcher(`/api/v1/stocks/${id}`, { method: "PATCH", body: data }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["stocks"] }),
	})
}

// Stok sil
export function useDeleteStock() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) =>
			mutationFetcher(`/api/v1/stocks/${id}`, { method: "DELETE" }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["stocks"] }),
	})
}

// Ziyaret stok kullanımları
export function useVisitStockUsages(visitId: string) {
	return useQuery({
		queryKey: ["visit-stock-usages", visitId],
		queryFn: () => fetcher(`/api/v1/visits/${visitId}/stock-usages`),
		enabled: !!visitId,
	})
}

// Ziyarete stok ekle
export function useAddVisitStockUsage(visitId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (data: { stockItemId: string; quantity: number; unitPrice?: number; notes?: string }) =>
			mutationFetcher(`/api/v1/visits/${visitId}/stock-usages`, { method: "POST", body: data }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["visit-stock-usages", visitId] })
			qc.invalidateQueries({ queryKey: ["visits"] })
			qc.invalidateQueries({ queryKey: ["stocks"] })
		},
	})
}

// Ziyaretten stok kullanımını kaldır
export function useRemoveVisitStockUsage(visitId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (usageId: string) =>
			mutationFetcher(`/api/v1/visits/${visitId}/stock-usages/${usageId}`, { method: "DELETE" }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["visit-stock-usages", visitId] })
			qc.invalidateQueries({ queryKey: ["visits"] })
			qc.invalidateQueries({ queryKey: ["stocks"] })
		},
	})
}
