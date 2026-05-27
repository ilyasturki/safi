import { throwFsError } from '~~/server/utils/errors'
import { writeKeyBindings } from '~~/server/utils/keybindings'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody<unknown>(event)
        return await writeKeyBindings(body)
    } catch (error) {
        console.error('Error writing keybindings:', error)
        throwFsError(error, 'Failed to write keybindings')
    }
})
