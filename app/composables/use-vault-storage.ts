import type { RemovableRef } from '@vueuse/core'
import { useLocalStorage } from '@vueuse/core'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

import { useActiveVault } from '~/composables/use-active-vault'

export function useVaultStorage<T>(
    suffix: MaybeRefOrGetter<string>,
    defaults: T,
): RemovableRef<T> {
    const { id } = useActiveVault()
    const key = computed(
        () => `safi:vault:${id.value}:${toValue(suffix)}`,
    )
    return useLocalStorage<T>(key, defaults)
}
