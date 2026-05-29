import { useVaultStorage } from '~/composables/use-vault-storage'

export function useLastEditedFile() {
    const lastEditedFilePath = useVaultStorage<string | undefined>(
        'last-edited-file',
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
