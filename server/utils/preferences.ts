import { constants } from 'node:fs'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import type { Preferences } from '~~/shared/types/preferences'
import {
    DEFAULT_PRIMARY_COLOR_ID,
    isPrimaryColorId,
} from '~~/shared/utils/primary-colors'
import { getConfigPath } from '~~/server/utils/vaults'

const PREFERENCES_FILE = 'preferences.json'

function getPreferencesPath(): { dir: string; file: string } {
    const dir = getConfigPath()
    const file = path.join(dir, PREFERENCES_FILE)
    return { dir, file }
}

function defaultPreferences(): Preferences {
    return {
        primaryColorId: DEFAULT_PRIMARY_COLOR_ID,
        enableVimMode: false,
    }
}

function sanitizePreferences(input: unknown): Preferences {
    const base = defaultPreferences()
    if (typeof input !== 'object' || input === null) return base

    const candidate: Record<string, unknown> = { ...input }

    if (isPrimaryColorId(candidate.primaryColorId)) {
        base.primaryColorId = candidate.primaryColorId
    }

    if (typeof candidate.enableVimMode === 'boolean') {
        base.enableVimMode = candidate.enableVimMode
    }

    return base
}

export async function readPreferences(): Promise<Preferences> {
    const { file } = getPreferencesPath()

    try {
        await access(file, constants.R_OK)
    } catch {
        return defaultPreferences()
    }

    try {
        const raw = await readFile(file, 'utf8')
        const parsed = JSON.parse(raw) as unknown
        return sanitizePreferences(parsed)
    } catch {
        return defaultPreferences()
    }
}

export async function writePreferences(
    input: unknown,
): Promise<Preferences> {
    const sanitized = sanitizePreferences(input)
    const { dir, file } = getPreferencesPath()

    try {
        await access(dir, constants.W_OK)
    } catch {
        await mkdir(dir, { recursive: true })
    }

    await writeFile(file, `${JSON.stringify(sanitized, null, 2)}\n`, 'utf8')
    return sanitized
}
