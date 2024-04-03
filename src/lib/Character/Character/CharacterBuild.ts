import { CommonItem } from '@/lib/common/Items'

export interface CharacterBindingBuild extends CommonItem {
  loadedId: string | null
  matchLoadedId: (loadCategory: string, id: number | null) => boolean
}

export function getLoadedId(loadCategory: string, id: number | null) {
  if (id === null) {
    return null
  }
  return `${loadCategory}-${id}`
}

export function initLoadedId(
  instance: CharacterBindingBuild,
  loadCategory: string,
  id: number | null
) {
  if (id === null) {
    return
  }
  instance.loadedId = getLoadedId(loadCategory, id)
}

export function checkLoadedId(
  instance: CharacterBindingBuild,
  loadCategory: string,
  id: number | null
) {
  return (
    instance.loadedId !== null &&
    id !== null &&
    getLoadedId(loadCategory, id) === instance.loadedId
  )
}
