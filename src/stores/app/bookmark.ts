import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'

export const enum BookmarkTypes {
  Item = 'item',
  Skill = 'skill',
}

export interface BookmarkItem {
  type: BookmarkTypes
  payload: string
}

export const useBookmarkStore = defineStore('app-bookmark', () => {
  const SAVE_STORAGE_KEY = 'app--bookmarks-v1'

  const _items = ref<BookmarkItem[] | null>(null)

  const items = computed(() => {
    if (_items.value === null) {
      const datas = window.localStorage.getItem(SAVE_STORAGE_KEY)
      try {
        _items.value = (datas !== null ? JSON.parse(datas) : []) as BookmarkItem[]
      } catch (err) {
        window.localStorage.setItem(SAVE_STORAGE_KEY + '-tmp', datas!)
        _items.value = []
      }
    }
    return _items.value
  })

  const _save = () => {
    window.localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(items))
  }

  const hasBookmark = (item: BookmarkItem) => {
    return items.value.some(_item => _item.type === item.type && _item.payload === item.payload)
  }

  const toggleBookmark = (item: BookmarkItem) => {
    const idx = items.value.findIndex(
      _item => _item.type === item.type && _item.payload === item.payload
    )
    if (idx > -1) {
      items.value.splice(idx, 1)
    } else {
      items.value.push(item)
    }

    _save()
  }

  return {
    bookmarks: readonly(items),
    hasBookmark,
    toggleBookmark,
  }
})
