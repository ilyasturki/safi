import { throwFsError } from '~~/server/utils/errors'
import { writePreferences } from '~~/server/utils/preferences'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody<unknown>(event)
        return await writePreferences(body)
    } catch (error) {
        console.error('Error writing preferences:', error)
        throwFsError(error, 'Failed to write preferences')
    }
})
