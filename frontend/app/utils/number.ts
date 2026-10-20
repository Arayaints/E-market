export const formatCurrency = (amount?: number | null): string => {
	if (amount === null || amount === undefined) return "฿0"
	return "฿" + Number(amount).toLocaleString("th-TH", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	})
}

export const formatNumber = (val?: number | null): string => {
	if (val === null || val === undefined) return "0"
	return Number(val).toLocaleString("th-TH")
}
