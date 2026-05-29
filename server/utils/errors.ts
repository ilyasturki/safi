import { HTTP_STATUS } from '~~/shared/utils/http-status'

function buildPermissionHint(): string {
    const uid = process.getuid?.() ?? '?'
    const gid = process.getgid?.() ?? '?'
    return `Vault directory is not writable by the server process (uid=${uid}, gid=${gid}). Ensure the vault directory is writable by this user. In Docker, set PUID and PGID env vars to match.`
}

function isH3Error(error: unknown): error is { statusCode: number } {
    return (
        typeof error === 'object'
        && error !== null
        && 'statusCode' in error
        && typeof (error as { statusCode: unknown }).statusCode === 'number'
    )
}

export function throwFsError(error: unknown, defaultMessage: string): never {
    if (isH3Error(error)) {
        throw error
    }

    const code =
        typeof error === 'object' && error !== null && 'code' in error ?
            (error as { code?: unknown }).code
        :   undefined

    if (typeof code !== 'string') {
        throw createError({
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            statusMessage: defaultMessage,
        })
    }

    switch (code) {
        case 'EACCES':
        case 'EPERM':
            throw createError({
                statusCode: HTTP_STATUS.FORBIDDEN,
                statusMessage: buildPermissionHint(),
            })
        case 'EROFS':
            throw createError({
                statusCode: HTTP_STATUS.FORBIDDEN,
                statusMessage: 'Vault is mounted read-only',
            })
        case 'ENOSPC':
            throw createError({
                statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
                statusMessage: 'No space left on device',
            })
        case 'ENAMETOOLONG':
            throw createError({
                statusCode: HTTP_STATUS.BAD_REQUEST,
                statusMessage: 'Name is too long',
            })
        case 'EISDIR':
            throw createError({
                statusCode: HTTP_STATUS.BAD_REQUEST,
                statusMessage: 'Expected a file but found a folder at this path',
            })
        case 'ENOTDIR':
            throw createError({
                statusCode: HTTP_STATUS.BAD_REQUEST,
                statusMessage: 'Expected a folder but found a file in the path',
            })
        case 'ENOENT':
            throw createError({
                statusCode: HTTP_STATUS.NOT_FOUND,
                statusMessage: 'File or folder not found',
            })
        case 'EEXIST':
        case 'ENOTEMPTY':
            throw createError({
                statusCode: HTTP_STATUS.CONFLICT,
                statusMessage: 'A file or folder with this name already exists',
            })
        case 'EXDEV':
            throw createError({
                statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
                statusMessage:
                    'Cannot move across filesystems — vault spans multiple mounts',
            })
        default:
            throw createError({
                statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
                statusMessage: defaultMessage,
            })
    }
}
