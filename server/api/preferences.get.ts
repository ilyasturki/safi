import { throwFsError } from '~~/server/utils/errors'
import { readPreferences } from '~~/server/utils/preferences'

export default defineEventHandler(async () => {
    try {
        return await readPreferences()
    } catch (error) {
        console.error('Error reading preferences:', error)
        throwFsError(error, 'Failed to read preferences')
    }
})
