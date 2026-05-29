import type { Vault } from '~~/server/utils/vaults'

declare module 'h3' {
    interface H3EventContext {
        vault?: Vault
    }
}
