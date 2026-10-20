import { defineStore } from "pinia"

export interface IErrorState {
	lastError: string | null
	errors: Record<string, string>
}

export const useErrorStore = defineStore("error", {
	state: (): IErrorState => ({
		lastError: null,
		errors: {},
	}),
	actions: {
		setError(message: string, fields: Record<string, string> = {}) {
			this.lastError = message
			this.errors = fields
		},
		clearError() {
			this.lastError = null
			this.errors = {}
		},
	},
})
