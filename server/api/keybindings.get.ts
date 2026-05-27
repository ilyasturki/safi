import { throwFsError } from '~~/server/utils/errors'
import { readKeyBindings } from '~~/server/utils/keybindings'

export default defineEventHandler(async () => {
    try {
        return await readKeyBindings()
    } catch (error) {
        console.error('Error reading keybindings:', error)
        throwFsError(error, 'Failed to read keybindings')
    }
})
