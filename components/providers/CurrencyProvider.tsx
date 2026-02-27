"use client"

import React, { createContext, useContext, useCallback, useMemo, useEffect, useState } from "react"
import {
	formatCurrency as formatCurrencyUtil,
	convertFromBase,
	type DisplayCurrency,
} from "@/lib/utils/currency"

interface CurrencyContextValue {
	currency: DisplayCurrency
	setCurrency: (c: DisplayCurrency) => void
	formatCurrency: (amountInTry: number) => string
	convertFromBase: (amountInTry: number) => number
	isLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function useCurrency() {
	const ctx = useContext(CurrencyContext)
	if (!ctx) {
		// Fallback when used outside provider (e.g. public pages)
		return {
			currency: "TRY" as DisplayCurrency,
			setCurrency: () => {},
			formatCurrency: (amount: number) => formatCurrencyUtil(amount, "TRY"),
			convertFromBase: (amount: number) => amount,
			isLoading: false,
		}
	}
	return ctx
}

interface CurrencyProviderProps {
	children: React.ReactNode
	defaultCurrency?: DisplayCurrency
}

export function CurrencyProvider({ children, defaultCurrency = "TRY" }: CurrencyProviderProps) {
	const [currency, setCurrencyState] = useState<DisplayCurrency>(defaultCurrency)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		// Fetch user's currency preference
		fetch("/api/v1/user/settings")
			.then((res) => (res.ok ? res.json() : null))
			.then((data) => {
				if (data?.currencyPreference && (data.currencyPreference === "USD" || data.currencyPreference === "TRY")) {
					setCurrencyState(data.currencyPreference)
				}
			})
			.catch(() => {})
			.finally(() => setIsLoading(false))
	}, [])

	const setCurrency = useCallback((c: DisplayCurrency) => {
		setCurrencyState(c)
	}, [])

	const formatCurrency = useCallback(
		(amountInTry: number) => formatCurrencyUtil(amountInTry, currency),
		[currency]
	)

	const convert = useCallback(
		(amountInTry: number) => convertFromBase(amountInTry, currency),
		[currency]
	)

	const value = useMemo(
		() => ({
			currency,
			setCurrency,
			formatCurrency,
			convertFromBase: convert,
			isLoading,
		}),
		[currency, setCurrency, formatCurrency, convert, isLoading]
	)

	return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}
