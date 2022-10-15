import { reactive } from 'vue'

let registletQueryState: {
  itemDefaultVisible: boolean
  displayMode: 'category' | 'obtain-levels'
}

export function useRegistletQueryState() {
  if (!registletQueryState) {
    registletQueryState = reactive({
      itemDefaultVisible: false,
      displayMode: 'category',
    })
  }
  return registletQueryState
}
