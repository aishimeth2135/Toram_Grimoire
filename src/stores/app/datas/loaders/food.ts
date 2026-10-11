import { useCharacterFoodStore } from '@/stores/views/character/food-build'

export async function prepareFood(): Promise<() => Promise<void>> {
  return async () => {
    useCharacterFoodStore()
  }
}
