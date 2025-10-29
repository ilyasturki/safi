import { useLocalStorage } from '@vueuse/core'

const STORAGE_KEY = 'pure-editor:last-edited-file'

export function useLastEditedFile() {
    const lastEditedFilePath = useLocalStorage<string | undefined>(
        STORAGE_KEY,
        undefined,
    )

    const saveLastEditedFile = (filePath: string): void => {
        lastEditedFilePath.value = filePath
    }

    return {
        saveLastEditedFile,
        lastEditedFilePath,
    }
}
