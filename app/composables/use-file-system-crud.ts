/* eslint-disable typescript/no-unsafe-type-assertion -- casts narrow string paths to Nitro typed-route placeholders so the correct method overload is picked. */

async function createFile(path: string, content = '') {
    await $fetch(`/api/files/${path as ':path'}`, {
        method: 'POST',
        body: { content },
    })
}

async function createFolder(path: string) {
    await $fetch(`/api/folders/${path as '**:path'}`, {
        method: 'POST',
    })
}

async function renameFile(path: string, newName: string) {
    await $fetch(`/api/files/${path as ':path'}`, {
        method: 'PATCH',
        body: { newName },
    })
}

async function renameFolder(path: string, newName: string) {
    await $fetch(`/api/folders/${path as '**:path'}`, {
        method: 'PATCH',
        body: { newName },
    })
}

async function deleteFile(path: string) {
    await $fetch(`/api/files/${path as ':path'}`, {
        method: 'DELETE',
    })
}

async function deleteFolder(path: string) {
    await $fetch(`/api/folders/${path as '**:path'}`, {
        method: 'DELETE',
    })
}

async function copyFile(sourcePath: string, destinationPath: string) {
    const response = await $fetch('/api/files/copy', {
        method: 'POST',
        body: { sourcePath, destinationPath },
    })
    return response
}

async function copyFolder(sourcePath: string, destinationPath: string) {
    const response = await $fetch('/api/folders/copy', {
        method: 'POST',
        body: { sourcePath, destinationPath },
    })
    return response
}

async function moveFile(sourcePath: string, destinationPath: string) {
    const response = await $fetch('/api/files/move', {
        method: 'POST',
        body: { sourcePath, destinationPath },
    })
    return response
}

async function moveFolder(sourcePath: string, destinationPath: string) {
    const response = await $fetch('/api/folders/move', {
        method: 'POST',
        body: { sourcePath, destinationPath },
    })
    return response
}

export function useFileSystemCrud() {
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
