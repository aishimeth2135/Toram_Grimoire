import type { App } from 'vue'

import Confirm from '@/shared/setup/Confirm'

export default function (app: App) {
  const { confirm } = Confirm()
  app.config.globalProperties.$confirm = confirm
}
