import {
  Ref,
  WritableComputedRef,
  computed,
  onMounted,
  onUnmounted,
  reactive,
  ref,
} from 'vue'

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
const viewStatesMap = new Map<string, (() => void)[]>()

export function defineViewState<State extends Record<string, any>>(
  id: string,
  init: () => State
): () => State {
  const fun = function () {
    if (!statesMap.has(fun)) {
      statesMap.set(fun, init())
    }
    return statesMap.get(fun)! as State
  }

  if (!viewStatesMap.has(id)) {
    viewStatesMap.set(id, [fun])
  } else {
    viewStatesMap.get(id)!.push(fun)
  }

  return fun
}

export function registViewStatesCleaning(id: string) {
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

type ComponentContext = Record<string, any>

export const useContext = <Context extends ComponentContext>() => {
  const contexts = new Map<string, Context>()

  let currentId = 0
  const getNextId = () => {
    currentId += 1
    return currentId.toString()
  }

  const allocContext = (context: Context): { id: string; context: Context } => {
    const id = getNextId()
    contexts.set(id, context)
    return { id, context }
  }

  const getContext = (id: string) => {
    return contexts.get(id) ?? null
  }

  const deallocContext = (id: string) => {
    return contexts.delete(id)
  }

  return {
    allocContext,
    deallocContext,
    getContext,
  }
}
