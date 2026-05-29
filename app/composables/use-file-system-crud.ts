/* eslint-disable typescript/no-unsafe-type-assertion -- casts narrow string paths to Nitro typed-route placeholders so the correct method overload is picked. */

import { useActiveVault } from '~/composables/use-active-vault'

export function useFileSystemCrud() {
    const { apiBase } = useActiveVault()
    const base = () => apiBase.value

    async function createFile(path: string, content = '') {
        await $fetch(
            `${base()}/files/${path}` as `/api/vaults/:vault/files/:path`,
            {
                method: 'POST',
                body: { content },
            },
        )
    }

    async function createFolder(path: string) {
        await $fetch(
            `${base()}/folders/${path}` as `/api/vaults/:vault/folders/**:path`,
            {
                method: 'POST',
            },
        )
    }

    async function renameFile(path: string, newName: string) {
        await $fetch(
            `${base()}/files/${path}` as `/api/vaults/:vault/files/:path`,
            {
                method: 'PATCH',
                body: { newName },
            },
        )
    }

    async function renameFolder(path: string, newName: string) {
        await $fetch(
            `${base()}/folders/${path}` as `/api/vaults/:vault/folders/**:path`,
            {
                method: 'PATCH',
                body: { newName },
            },
        )
    }

    async function deleteFile(path: string) {
        await $fetch(
            `${base()}/files/${path}` as `/api/vaults/:vault/files/:path`,
            {
                method: 'DELETE',
            },
        )
    }

    async function deleteFolder(path: string) {
        await $fetch(
            `${base()}/folders/${path}` as `/api/vaults/:vault/folders/**:path`,
            {
                method: 'DELETE',
            },
        )
    }

    async function copyFile(sourcePath: string, destinationPath: string) {
        return await $fetch(`${base()}/files/copy`, {
            method: 'POST',
            body: { sourcePath, destinationPath },
        })
    }

    async function copyFolder(sourcePath: string, destinationPath: string) {
        return await $fetch(`${base()}/folders/copy`, {
            method: 'POST',
            body: { sourcePath, destinationPath },
        })
    }

    async function moveFile(sourcePath: string, destinationPath: string) {
        return await $fetch(`${base()}/files/move`, {
            method: 'POST',
            body: { sourcePath, destinationPath },
        })
    }

    async function moveFolder(sourcePath: string, destinationPath: string) {
        return await $fetch(`${base()}/folders/move`, {
            method: 'POST',
            body: { sourcePath, destinationPath },
        })
    }

    return {
        createFile,
        createFolder,
        renameFile,
        renameFolder,
        deleteFile,
        deleteFolder,
        copyFile,
        copyFolder,
        moveFile,
        moveFolder,
    }
}
