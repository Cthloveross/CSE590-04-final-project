import 'pinia'
import type { PersistedStateOptions } from 'pinia-plugin-persistedstate'
import type { StateTree } from 'pinia'

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S extends StateTree, Store> {
    persist?: boolean | PersistedStateOptions
  }
}
