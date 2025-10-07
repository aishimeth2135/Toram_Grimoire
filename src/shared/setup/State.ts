import { type Ref, onUnmounted } from 'vue'

import { ViewNames } from '../consts/view'
import type { AnyFunction } from '../utils/type'

/**
 * The lite state management API that is like `pinia`.
 * intention: prevent the unnecessary memory consumption if this state is never be used.
 */
export function defineState<State extends Record<string, any>>(init: () => State): () => State {
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

export function useToggleList<Item>(list: Ref<Item[]>) {
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
  /**
   * Allow to use on native event like `click`
   * @returns The old value of the boolean ref
   */
  (value?: boolean | Event): boolean
}

export function useToggle(target: Ref<boolean>): ToggleHelper {
  return (value => {
    const oldValue = target.value
    // ignore `undefined`, `null`, `Event` or others
    target.value = typeof value === 'boolean' ? value : !target.value
    return oldValue
  }) satisfies ToggleHelper
}

interface ToggleGroupUtils {
  and: (callback: AnyFunction) => void
}
type ToggleGroupHandler = (value: boolean) => ToggleGroupUtils

export function useToggleGroup(helpers: ToggleHelper[]): ToggleGroupHandler {
  return (value: boolean) => {
    const oldValues: Map<ToggleHelper, boolean> = new Map()

    helpers.forEach(helper => {
      oldValues.set(helper, helper(value))
    })

    return {
      and: (toggleHelper: ToggleHelper) => {
        // call the callback after all toggles
        if (oldValues.has(toggleHelper)) {
          toggleHelper(!oldValues.get(toggleHelper))
        } else {
          // Do nothing. Should not call `and` with the helper who is not a group member.
        }
      },
    }
  }
}
