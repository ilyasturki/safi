import { constants } from 'node:fs'
import { access, readdir } from 'node:fs/promises'
import { homedir } from 'node:os'
import path from 'node:path'

import type { DirectoryEntry, DirectoryListing } from '~~/shared/types/api'
import { isHiddenFile } from '~~/server/utils/workspace'

async function isReadableDir(target: string): Promise<boolean> {
    try {
        await access(target, constants.R_OK)
        return true
    } catch {
        return false
    }
}

async function resolveTarget(requested: string | undefined): Promise<string> {
    if (requested && path.isAbsolute(requested)) {
        return path.resolve(requested)
    }

    // No (valid) path requested: start at the server user's home directory,
    // falling back to the filesystem root when home is unavailable — e.g. a
    // container system user whose home was never created.
    const home = homedir()
    if (await isReadableDir(home)) return home
    return path.parse(home).root || '/'
}

export default defineEventHandler(async (event): Promise<DirectoryListing> => {
    const query = getQuery(event)
    const requested = typeof query.path === 'string' ? query.path : undefined
    const target = await resolveTarget(requested)

    let dirents
    try {
        dirents = await readdir(target, { withFileTypes: true })
    } catch (error) {
        const code =
            error instanceof Error && 'code' in error ?
                (error as { code?: string }).code
            :   undefined
        if (code === 'ENOENT') {
            throw createError({
                statusCode: 404,
                statusMessage: `Directory not found: ${target}`,
            })
        }
        if (code === 'EACCES') {
            throw createError({
                statusCode: 403,
                statusMessage: `Directory not readable: ${target}`,
            })
        }
        if (code === 'ENOTDIR') {
            throw createError({
                statusCode: 400,
                statusMessage: `Not a directory: ${target}`,
            })
        }
        throw error
    }

    const entries: DirectoryEntry[] = dirents
        .filter((entry) => entry.isDirectory() && !isHiddenFile(entry.name))
        .map((entry) => ({
            name: entry.name,
            path: path.join(target, entry.name),
        }))
        .toSorted((a, b) => a.name.localeCompare(b.name))

    const parentPath = path.dirname(target)
    const parent = parentPath === target ? null : parentPath

    return { path: target, parent, entries }
})
