export const formatDate = (dateStr?: string | Date | null): string => {
	if (!dateStr) return "-"
	try {
		const d = new Date(dateStr)
		if (isNaN(d.getTime())) return String(dateStr)
		return d.toLocaleDateString("th-TH", {
			year: "numeric",
			month: "short",
			day: "numeric",
		})
	} catch {
		return String(dateStr)
	}
}

export const formatDateTime = (dateStr?: string | Date | null): string => {
	if (!dateStr) return "-"
	try {
		const d = new Date(dateStr)
		if (isNaN(d.getTime())) return String(dateStr)
		return d.toLocaleDateString("th-TH", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		})
	} catch {
		return String(dateStr)
	}
}
