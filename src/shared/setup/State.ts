import { Ref, onUnmounted } from 'vue'
import { ViewNames } from '../consts/view'

/**
 * The lite state management API that is like `pinia`.
 * intention: prevent the unnecessary memory consumption if this state is never be used.
 */
export function defineState<State extends Record<string, any>>(
  init: () => State
): () => State {
  let state: State

  return function () {
    if (!state) {
      state = init()
    }
    return state
  }
}

const statesMap = new Map<() => void, Record<string, any>>()
const viewStatesMap = new Map<ViewNames, (() => void)[]>()

export function defineViewState<State extends Record<string, any>>(
  id: ViewNames,
  init: () => State
): () => State {
  const stateGetter = function () {
    if (!statesMap.has(stateGetter)) {
      statesMap.set(stateGetter, init())
    }
    return statesMap.get(stateGetter)! as State
  }

  if (!viewStatesMap.has(id)) {
    viewStatesMap.set(id, [stateGetter])
  } else {
    viewStatesMap.get(id)!.push(stateGetter)
  }

  return stateGetter
}

export function registViewStatesCleaning(id: ViewNames) {
  onUnmounted(() => {
    if (viewStatesMap.has(id)) {
      viewStatesMap.get(id)!.forEach(item => statesMap.delete(item))
      viewStatesMap.delete(id)
    }
  })
}

export function useToggleList<Item extends any>(list: Ref<Item[]>) {
  const toggleItem = (item: Item) => {
    const idx = list.value.indexOf(item)
    if (idx > -1) {
      list.value.splice(idx, 1)
    } else {
      list.value.push(item)
    }
  }

  const itemSelected = (item: Item) => {
    return list.value.includes(item)
  }

  return { itemSelected, toggleItem }
}

interface ToggleHelper {
  (value?: boolean | any): void
}

export function useToggle(target: Ref<boolean>): ToggleHelper {
  return <ToggleHelper>((value) => {
    // ignore `undefined`, `null`, `Event` or others
    target.value = typeof value === 'boolean' ? value : !target.value
  })
}

export function useToggleGroup(helpers: ToggleHelper[]) {
  return (value: boolean) => {
    helpers.forEach(helper => helper(value))
  }
}
