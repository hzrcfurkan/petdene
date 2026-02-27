/**
 * Currency formatting with USD/TRY conversion
 * All prices in DB are stored in TRY (base currency).
 * User preference determines display currency; conversion applied when needed.
 */

export type DisplayCurrency = "USD" | "TRY"

// 1 USD = X TRY. Set via env NEXT_PUBLIC_USD_TO_TRY (e.g. 34.5)
const USD_TO_TRY = Number(process.env.NEXT_PUBLIC_USD_TO_TRY) || 34

/**
 * Convert amount from TRY (base) to display currency
 */
export function convertFromBase(amountInTry: number, toCurrency: DisplayCurrency): number {
	if (toCurrency === "USD") {
		return amountInTry / USD_TO_TRY
	}
	return amountInTry
}

/**
 * Format a number as currency with optional conversion
 * TRY: symbol ₺ on the right (Turkish standard: "100,00 ₺")
 * USD: symbol $ on the left (US standard: "$100.00")
 */
export function formatCurrency(
	amountInTry: number,
	displayCurrency: DisplayCurrency = "TRY"
): string {
	const displayAmount = convertFromBase(amountInTry, displayCurrency)
	const locale = displayCurrency === "TRY" ? "tr-TR" : "en-US"

	if (displayCurrency === "TRY") {
		// Turkish: number + " ₺" (symbol on right)
		const formatted = new Intl.NumberFormat(locale, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(displayAmount)
		return `${formatted} ₺`
	}
	// USD: standard Intl format ($ on left)
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(displayAmount)
}

/**
 * Format amount without currency symbol (for compact display)
 */
export function formatAmount(
	amountInTry: number,
	displayCurrency: DisplayCurrency = "TRY"
): string {
	const displayAmount = convertFromBase(amountInTry, displayCurrency)
	const locale = displayCurrency === "TRY" ? "tr-TR" : "en-US"

	return new Intl.NumberFormat(locale, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(displayAmount)
}

/**
 * Get currency symbol for display currency
 */
export function getCurrencySymbol(displayCurrency: DisplayCurrency = "TRY"): string {
	return displayCurrency === "TRY" ? "₺" : "$"
}

/**
 * Get the USD to TRY exchange rate (for admin display)
 */
export function getUsdToTryRate(): number {
	return USD_TO_TRY
}
