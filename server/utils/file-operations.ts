import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { isHiddenFile, isMarkdownFile } from './workspace'

export async function generateUniqueName(
    dirPath: string,
    baseName: string,
): Promise<string> {
    const ext = path.extname(baseName)
    const nameWithoutExt = baseName.slice(
        0,
        Math.max(0, baseName.lastIndexOf(ext)),
    )

    const existing = new Set(await readdir(dirPath))

    if (!existing.has(baseName)) return baseName

    let counter = 1
    let candidate = `${nameWithoutExt} (${counter})${ext}`
    while (existing.has(candidate)) {
        counter++
        candidate = `${nameWithoutExt} (${counter})${ext}`
    }
    return candidate
}

export async function copyFileWithContent(
    sourcePath: string,
    destPath: string,
): Promise<void> {
    const content = await readFile(sourcePath, 'utf8')
    await writeFile(destPath, content, 'utf8')
}

export async function copyFolderRecursive(
    sourcePath: string,
    destPath: string,
): Promise<void> {
    await mkdir(destPath, { recursive: true })

    const entries = await readdir(sourcePath, { withFileTypes: true })

    await Promise.all(
        entries
            .filter((entry) => !isHiddenFile(entry.name))
            .map(async (entry) => {
                const sourceEntryPath = path.join(sourcePath, entry.name)
                const destEntryPath = path.join(destPath, entry.name)

                if (entry.isDirectory()) {
                    await copyFolderRecursive(sourceEntryPath, destEntryPath)
                } else if (entry.isFile() && isMarkdownFile(entry.name)) {
                    await copyFile(sourceEntryPath, destEntryPath)
                }
            }),
    )
}
