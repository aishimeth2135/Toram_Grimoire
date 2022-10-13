import { reactive } from 'vue'

let registletQueryState: {
  itemDefaultVisible: boolean
}

export function useRegistletQueryState() {
  if (!registletQueryState) {
    registletQueryState = reactive({
      itemDefaultVisible: false,
    })
  }
  return registletQueryState
}
