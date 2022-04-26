import jsep from 'jsep'
import Iconify from '@iconify/iconify'

import Cyteria from '@/shared/utils/Cyteria'

export default function () {
  // jsep
  jsep.addIdentifierChar('@')
  jsep.addIdentifierChar('#')

  // iconify
  if (import.meta.env.MODE === 'production') {
    Iconify.disableCache('all')
    if (Cyteria.storageAvailable('localStorage')) {
      const storage = window.localStorage
      Array(localStorage.length).fill(null).map((_item, idx) => idx).forEach(idx => {
        const key = storage.key(idx)
        if (key && key.startsWith('iconify')) {
          storage.removeItem(key)
        }
      })
    }
  }
}
