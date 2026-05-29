import { constants } from 'node:fs'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import type { KeyBindingsFile } from '~~/shared/types/keybindings'
import {
    DEFAULT_EDITOR_KEYBINDINGS,
    DEFAULT_KEYBINDINGS,
    sanitizeKeyBindingsFile,
    sanitizePartialKeyBindingsFile,
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

function emptyFile(): KeyBindingsFile {
    return {
        shortcuts: { ...DEFAULT_KEYBINDINGS },
        editor: { ...DEFAULT_EDITOR_KEYBINDINGS },
    }
}

export async function readKeyBindings(): Promise<KeyBindingsFile> {
    const { file } = getKeybindingsPath()

    try {
        await access(file, constants.R_OK)
    } catch {
        return emptyFile()
    }

    try {
        const raw = await readFile(file, 'utf8')
        const parsed = JSON.parse(raw) as unknown
        return sanitizeKeyBindingsFile(parsed)
    } catch {
        return emptyFile()
    }
}

let writeChain: Promise<unknown> = Promise.resolve()

export function writeKeyBindings(input: unknown): Promise<KeyBindingsFile> {
    const partial = sanitizePartialKeyBindingsFile(input)
    const next = writeChain.then(
        () => performWrite(partial),
        () => performWrite(partial),
    )
    writeChain = next.catch(() => undefined)
    return next
}

async function performWrite(
    partial: Partial<KeyBindingsFile>,
): Promise<KeyBindingsFile> {
    const current = await readKeyBindings()
    const merged: KeyBindingsFile = {
        shortcuts: { ...current.shortcuts, ...partial.shortcuts },
        editor: { ...current.editor, ...partial.editor },
    }
    const { dir, file } = getKeybindingsPath()

    try {
        await access(dir, constants.W_OK)
    } catch {
        await mkdir(dir, { recursive: true })
    }

    await writeFile(file, `${JSON.stringify(merged, null, 2)}\n`, 'utf8')
    return merged
}
