import type { FolderResponse } from '~~/shared/types/api'
import { listDirectory } from '~~/server/utils/workspace'

export default defineEventHandler(async (): Promise<FolderResponse> => {
    const path = ''

    const { files, directories } = await listDirectory(path)

    return {
        type: 'folder',
        files,
        directories,
        currentPath: path,
    }
})
