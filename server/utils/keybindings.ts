import { constants } from 'node:fs'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import type { KeyBindings } from '~~/shared/types/keybindings'
import {
    DEFAULT_KEYBINDINGS,
    sanitizeKeyBindings,
    sanitizePartialKeyBindings,
} from '~~/shared/utils/keybindings'
import { getWorkspacePath } from '~~/server/utils/workspace'

const KEYBINDINGS_DIR = '.safi'
const KEYBINDINGS_FILE = 'keybindings.json'

function getKeybindingsPath(): { dir: string; file: string } {
    const workspacePath = getWorkspacePath()
    const dir = path.join(workspacePath, KEYBINDINGS_DIR)
    const file = path.join(dir, KEYBINDINGS_FILE)
    return { dir, file }
}

export async function readKeyBindings(): Promise<KeyBindings> {
    const { file } = getKeybindingsPath()

    try {
        await access(file, constants.R_OK)
    } catch {
        return { ...DEFAULT_KEYBINDINGS }
    }

    try {
        const raw = await readFile(file, 'utf8')
        const parsed = JSON.parse(raw) as unknown
        return sanitizeKeyBindings(parsed)
    } catch {
        return { ...DEFAULT_KEYBINDINGS }
    }
}

export async function writeKeyBindings(
    input: unknown,
): Promise<KeyBindings> {
    const partial = sanitizePartialKeyBindings(input)
    const current = await readKeyBindings()
    const merged: KeyBindings = { ...current, ...partial }
    const { dir, file } = getKeybindingsPath()

    try {
        await access(dir, constants.W_OK)
    } catch {
        await mkdir(dir, { recursive: true })
    }

    await writeFile(file, `${JSON.stringify(merged, null, 2)}\n`, 'utf8')
    return merged
}
