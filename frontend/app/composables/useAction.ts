import { useActionStore } from "~/core/shared/store/ActionStore"

export const useAction = () => {
	const actionStore = useActionStore()

	const runAction = async <T>(key: string, action: () => Promise<T>): Promise<T> => {
		actionStore.start(key)
		try {
			return await action()
		} finally {
			actionStore.finish(key)
		}
	}

	return {
		runAction,
		isLoading: actionStore.isLoading,
	}
}
