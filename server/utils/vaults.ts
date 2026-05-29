import type { H3Event } from 'h3'
import { constants } from 'node:fs'
import { access, readdir, stat } from 'node:fs/promises'
import path from 'node:path'

import { isHiddenFile } from '~~/server/utils/workspace'

export interface Vault {
    id: string
    name: string
    path: string
}

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

export function getVaultsRoot(): string {
    const { vaultsPath } = useRuntimeConfig()
    if (!vaultsPath) {
        throw createError({
            statusCode: 500,
            statusMessage:
                'NUXT_VAULTS_PATH environment variable is not set. Please configure it to point to the parent directory that holds your vault folders.',
        })
    }
    return path.resolve(vaultsPath)
}

export function getConfigPath(): string {
    const { configPath } = useRuntimeConfig()
    if (!configPath) {
        throw createError({
            statusCode: 500,
            statusMessage:
                'NUXT_CONFIG_PATH environment variable is not set. Please configure it to point to a directory where global preferences and keybindings will be stored.',
        })
    }
    return path.resolve(configPath)
}

function toVault(root: string, name: string): Vault {
    return {
        id: encodeURIComponent(name),
        name,
        path: path.join(root, name),
    }
}

export async function listVaults(): Promise<Vault[]> {
    const root = getVaultsRoot()

    try {
        await access(root, constants.R_OK)
    } catch {
        throw createError({
            statusCode: 500,
            statusMessage: `Vaults directory not readable: ${root}`,
        })
    }

    const entries = await readdir(root, { withFileTypes: true })

    const vaults = entries
        .filter((entry) => entry.isDirectory() && !isHiddenFile(entry.name))
        .map((entry) => toVault(root, entry.name))

    vaults.sort((a, b) => a.name.localeCompare(b.name))

    return vaults
}

export async function resolveVault(id: string): Promise<Vault> {
    const root = getVaultsRoot()
    let name: string
    try {
        name = decodeURIComponent(id)
    } catch {
        throw createError({ statusCode: 404, statusMessage: 'Vault not found' })
    }

    if (!name || isHiddenFile(name) || name.includes('/') || name.includes('\\')) {
        throw createError({ statusCode: 404, statusMessage: 'Vault not found' })
    }

    const vaultPath = path.join(root, name)
    try {
        const stats = await stat(vaultPath)
        if (!stats.isDirectory()) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Vault not found',
            })
        }
    } catch (error) {
        if (
            error instanceof Error
            && 'code' in error
            && (error as { code?: string }).code === 'ENOENT'
        ) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Vault not found',
            })
        }
        throw error
    }

    return { id: encodeURIComponent(name), name, path: vaultPath }
}
