/**
 * The lite state management API that is like `pinia`.
 * intention: prevent the unnecessary memory consumption if this state is never be used.
 */
export function defineState<State extends object>(
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
