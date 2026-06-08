import type { H3Event } from 'h3'
import { createHash } from 'node:crypto'
import { constants } from 'node:fs'
import { access, mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import path from 'node:path'

export interface Vault {
    id: string
    name: string
    path: string
}

const VAULTS_FILE = 'vaults.json'

export function getVaultContext(event: H3Event): Vault {
    const vault = event.context.vault
    if (!vault) {
        throw createError({
            statusCode: 500,
            statusMessage:
                'Vault context missing — route is not vault-scoped or middleware did not run.',
        })
    }
    return vault
}

export function getConfigPath(): string {
    const { configPath } = useRuntimeConfig()
    if (configPath) {
        return path.resolve(configPath)
    }

    // No explicit NUXT_CONFIG_PATH — fall back to the XDG Base Directory
    // default: $XDG_CONFIG_HOME/safi, or ~/.config/safi. Per the XDG spec a
    // relative $XDG_CONFIG_HOME is invalid and ignored.
    const xdgConfigHome = process.env.XDG_CONFIG_HOME
    const base =
        xdgConfigHome && path.isAbsolute(xdgConfigHome) ?
            xdgConfigHome
        :   path.join(homedir(), '.config')
    return path.join(base, 'safi')
}

function getVaultsFilePath(): string {
    return path.join(getConfigPath(), VAULTS_FILE)
}

// A vault's identity is derived from its absolute path so that registering the
// same folder twice is idempotent and ids stay stable across restarts. The hex
// digest is URL-safe, which matters because it becomes the `[vault]` route
// segment.
function makeVaultId(absolutePath: string): string {
    return createHash('sha256').update(absolutePath).digest('hex').slice(0, 16)
}

function toVault(absolutePath: string, name?: string): Vault {
    const trimmed = name?.trim()
    return {
        id: makeVaultId(absolutePath),
        name: trimmed || path.basename(absolutePath),
        path: absolutePath,
    }
}

function sanitizeRegistry(input: unknown): Vault[] {
    if (!Array.isArray(input)) return []

    const vaults: Vault[] = []
    const seen = new Set<string>()

    for (const entry of input) {
        if (typeof entry !== 'object' || entry === null) continue
        const candidate = entry as Record<string, unknown>
        if (
            typeof candidate.path !== 'string'
            || !path.isAbsolute(candidate.path)
        ) {
            continue
        }

        const absolutePath = path.resolve(candidate.path)
        const id = makeVaultId(absolutePath)
        if (seen.has(id)) continue
        seen.add(id)

        const name =
            typeof candidate.name === 'string' ? candidate.name : undefined
        vaults.push(toVault(absolutePath, name))
    }

    return vaults
}

async function readVaultRegistry(): Promise<Vault[]> {
    const file = getVaultsFilePath()

    try {
        await access(file, constants.R_OK)
    } catch {
        return []
    }

    try {
        const raw = await readFile(file, 'utf8')
        return sanitizeRegistry(JSON.parse(raw) as unknown)
    } catch {
        return []
    }
}

async function writeVaultRegistry(vaults: Vault[]): Promise<void> {
    const dir = getConfigPath()
    const file = getVaultsFilePath()

    try {
        await access(dir, constants.W_OK)
    } catch {
        await mkdir(dir, { recursive: true })
    }

    await writeFile(file, `${JSON.stringify(vaults, null, 2)}\n`, 'utf8')
}

async function assertReadableDirectory(absolutePath: string): Promise<void> {
    let stats
    try {
        stats = await stat(absolutePath)
    } catch {
        throw createError({
            statusCode: 404,
            statusMessage: `Directory not found: ${absolutePath}`,
        })
    }
    if (!stats.isDirectory()) {
        throw createError({
            statusCode: 400,
            statusMessage: `Not a directory: ${absolutePath}`,
        })
    }
    try {
        await access(absolutePath, constants.R_OK)
    } catch {
        throw createError({
            statusCode: 403,
            statusMessage: `Directory not readable: ${absolutePath}`,
        })
    }
}

export async function listVaults(): Promise<Vault[]> {
    const vaults = await readVaultRegistry()
    return vaults.toSorted((a, b) => a.name.localeCompare(b.name))
}

export async function resolveVault(id: string): Promise<Vault> {
    const vaults = await readVaultRegistry()
    const vault = vaults.find((entry) => entry.id === id)
    if (!vault) {
        throw createError({ statusCode: 404, statusMessage: 'Vault not found' })
    }

    // The folder may have moved or been deleted on disk after registration.
    await assertReadableDirectory(vault.path)
    return vault
}

export async function registerVault(inputPath: unknown): Promise<Vault> {
    if (typeof inputPath !== 'string' || !inputPath.trim()) {
        throw createError({
            statusCode: 400,
            statusMessage: 'A folder path is required',
        })
    }
    if (!path.isAbsolute(inputPath)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Vault path must be absolute',
        })
    }

    const absolutePath = path.resolve(inputPath)
    await assertReadableDirectory(absolutePath)

    const vault = toVault(absolutePath)
    const vaults = await readVaultRegistry()
    const existing = vaults.find((entry) => entry.id === vault.id)
    if (existing) return existing

    vaults.push(vault)
    await writeVaultRegistry(vaults)
    return vault
}

export async function removeVault(id: string): Promise<void> {
    const vaults = await readVaultRegistry()
    const next = vaults.filter((entry) => entry.id !== id)
    if (next.length === vaults.length) return
    await writeVaultRegistry(next)
}
