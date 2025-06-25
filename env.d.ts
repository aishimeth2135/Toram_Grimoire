/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="@modyfi/vite-plugin-yaml/modules" />
import type { RouteLocationNormalized } from 'vue-router'

// workround for vue-router
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $route: RouteLocationNormalized
  }
}

// declare module 'virtual:pwa-register/vue' {
//   import type { Ref } from 'vue'

//   export type RegisterSWOptions = {
//     immediate?: boolean
//     onNeedRefresh?: () => void
//     onOfflineReady?: () => void
//     onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
//     onRegisterError?: (error: any) => void
//   }

//   export function useRegisterSW(options?: RegisterSWOptions): {
//     needRefresh: Ref<boolean>
//     offlineReady: Ref<boolean>
//     updateServiceWorker: (reloadPage?: boolean) => Promise<void>
//   }
// }
