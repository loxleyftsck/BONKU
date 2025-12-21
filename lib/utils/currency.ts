/**
 * Format number as Indonesian Rupiah currency
 * @param amount - Amount in IDR (e.g., 150000)
 * @returns Formatted string (e.g., "Rp 150.000")
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

/**
 * Format number with thousand separator
 * @param value - Number to format
 * @returns Formatted string (e.g., "150.000")
 */
export function formatNumber(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value)
}

/**
 * Parse currency string to number
 * @param value - Currency string (e.g., "Rp 150.000" or "150000")
 * @returns Number value
 */
export function parseCurrency(value: string): number {
    const cleaned = value.replace(/[^0-9]/g, '')
    return parseInt(cleaned, 10) || 0
}
