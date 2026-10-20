import { defineStore } from "pinia"

export interface IActionState {
	activeActions: Record<string, boolean>
	globalLoading: boolean
}

export const useActionStore = defineStore("action", {
	state: (): IActionState => ({
		activeActions: {},
		globalLoading: false,
	}),
	getters: {
		isLoading: (state) => (actionKey?: string) => {
			if (actionKey) {
				return !!state.activeActions[actionKey]
			}
			return state.globalLoading || Object.values(state.activeActions).some(Boolean)
		},
	},
	actions: {
		start(actionKey: string) {
			this.activeActions[actionKey] = true
		},
		finish(actionKey: string) {
			delete this.activeActions[actionKey]
		},
		setGlobalLoading(status: boolean) {
			this.globalLoading = status
		},
	},
})
