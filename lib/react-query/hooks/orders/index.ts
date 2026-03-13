"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetcher, mutationFetcher } from "../../fetcher"

// ─── Types ────────────────────────────────────────────────

export type OrderStatus   = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "SKIPPED"
export type OrderPriority = "URGENT" | "HIGH" | "NORMAL" | "LOW"
export type OrderType     = "MEDICATION" | "PROCEDURE" | "LAB" | "DIET" | "TASK"

export interface VetOrderLog {
	id:        string
	orderId:   string
	userId:    string
	action:    string
	note:      string | null
	createdAt: string
	user:      { id: string; name: string | null; email: string }
}

export interface VetOrder {
	id:            string
	visitId:       string
	petId:         string
	orderedById:   string
	assignedToId:  string | null
	type:          OrderType
	title:         string
	description:   string | null
	stockItemId:   string | null
	dose:          string | null
	route:         string | null
	frequency:     string | null
	duration:      string | null
	scheduledAt:   string | null
	priority:      OrderPriority
	status:        OrderStatus
	chargeToVisit: boolean
	unitPrice:     number
	createdAt:     string
	updatedAt:     string
	pet:           { id: string; name: string; species: string; patientNumber?: string; owner?: { id: string; name: string | null; phone: string | null } }
	visit:         { id: string; protocolNumber: number }
	orderedBy:     { id: string; name: string | null; email: string }
	assignedTo:    { id: string; name: string | null; email: string } | null
	stockItem:     { id: string; name: string; unit: string } | null
	logs:          VetOrderLog[]
}

export interface OrdersResponse {
	orders:     VetOrder[]
	pagination: { total: number; page: number; limit: number; pages: number }
}

export interface UseOrdersParams {
	visitId?:     string
	petId?:       string
	status?:      OrderStatus
	type?:        OrderType
	assignedToId?: string
	priority?:    OrderPriority
	today?:       boolean
	page?:        number
	limit?:       number
}

// ─── Hooks ────────────────────────────────────────────────

export function useOrders(params?: UseOrdersParams) {
	const q = new URLSearchParams()
	if (params?.visitId)     q.set("visitId",     params.visitId)
	if (params?.petId)       q.set("petId",       params.petId)
	if (params?.status)      q.set("status",      params.status)
	if (params?.type)        q.set("type",        params.type)
	if (params?.assignedToId) q.set("assignedToId", params.assignedToId)
	if (params?.priority)    q.set("priority",    params.priority)
	if (params?.today)       q.set("today",       "true")
	if (params?.page)        q.set("page",        String(params.page))
	if (params?.limit)       q.set("limit",       String(params.limit))

	const url = `/api/v1/orders?${q.toString()}`
	return useQuery<OrdersResponse>({
		queryKey: ["orders", params],
		queryFn:  () => fetcher<OrdersResponse>(url),
	})
}

export function useOrder(id: string | null) {
	return useQuery<VetOrder>({
		queryKey: ["orders", id],
		queryFn:  () => fetcher<VetOrder>(`/api/v1/orders/${id}`),
		enabled:  !!id,
	})
}

export function useCreateOrder() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (data: Partial<VetOrder>) =>
			mutationFetcher<VetOrder>("/api/v1/orders", { method: "POST", body: data }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["orders"] })
			qc.invalidateQueries({ queryKey: ["visits"] })
		},
	})
}

export function useUpdateOrder() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ id, ...data }: { id: string } & Partial<VetOrder> & { note?: string }) =>
			mutationFetcher<VetOrder>(`/api/v1/orders/${id}`, { method: "PATCH", body: data }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["orders"] })
			qc.invalidateQueries({ queryKey: ["visits"] })
		},
	})
}

export function useDeleteOrder() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) =>
			mutationFetcher<{ success: boolean }>(`/api/v1/orders/${id}`, { method: "DELETE", body: {} }),
		onSuccess: () => { qc.invalidateQueries({ queryKey: ["orders"] }) },
	})
}

// ─── Yardımcı sabitler ───────────────────────────────────

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
	MEDICATION: "💊 İlaç",
	PROCEDURE:  "🩹 Prosedür",
	LAB:        "🔬 Tetkik",
	DIET:       "🥗 Diyet",
	TASK:       "📋 Görev",
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
	PENDING:     "Bekliyor",
	IN_PROGRESS: "Devam Ediyor",
	COMPLETED:   "Tamamlandı",
	CANCELLED:   "İptal",
	SKIPPED:     "Atlandı",
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
	PENDING:     "bg-yellow-100 text-yellow-800",
	IN_PROGRESS: "bg-blue-100 text-blue-800",
	COMPLETED:   "bg-green-100 text-green-800",
	CANCELLED:   "bg-red-100 text-red-800",
	SKIPPED:     "bg-gray-100 text-gray-600",
}

export const ORDER_PRIORITY_LABELS: Record<OrderPriority, string> = {
	URGENT: "🔴 Acil",
	HIGH:   "🟠 Yüksek",
	NORMAL: "🟡 Normal",
	LOW:    "⚪ Düşük",
}

export const ORDER_PRIORITY_COLORS: Record<OrderPriority, string> = {
	URGENT: "border-l-red-500 bg-red-50/50",
	HIGH:   "border-l-orange-400 bg-orange-50/50",
	NORMAL: "border-l-blue-400",
	LOW:    "border-l-gray-300",
}

export const ROUTE_OPTIONS = ["IV", "IM", "SC", "PO (Ağızdan)", "Topikal", "İnhalasyon", "Rektal", "Göz/Kulak", "Diğer"]
export const FREQUENCY_OPTIONS = ["Tek doz", "Günde 1x", "Günde 2x (sabah/akşam)", "Günde 3x", "4 saatte bir", "6 saatte bir", "8 saatte bir", "12 saatte bir", "Gerektiğinde"]
export const DURATION_OPTIONS   = ["Tek uygulama", "1 gün", "3 gün", "5 gün", "7 gün", "10 gün", "14 gün", "Süresiz"]
