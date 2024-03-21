import { Ref, onUnmounted } from 'vue'

import { defineState, useContext } from '@/shared/setup/State'

interface CardRowContext {
  item: Ref<any>
}

const useCardRowState = defineState(() => {
  const {
    allocContext: allocCardRowContext,
    deallocContext: deallocCardRowContext,
    getContext: getCardRowContext,
  } = useContext<CardRowContext>()

  const CARD_ROW_ID_ATTR_NAME = 'data-rid'

  return {
    allocCardRowContext,
    deallocCardRowContext,
    getCardRowContext,
    CARD_ROW_ID_ATTR_NAME,
  }
})

export function useCardRowContext(context: CardRowContext) {
  const { allocCardRowContext, deallocCardRowContext, CARD_ROW_ID_ATTR_NAME } =
    useCardRowState()

  const { id } = allocCardRowContext(context)

  onUnmounted(() => {
    deallocCardRowContext(id)
  })

  return {
    idBind: {
      name: CARD_ROW_ID_ATTR_NAME,
      value: id,
    },
  }
}

export function setupCardRowsDelegation() {
  const { getCardRowContext, CARD_ROW_ID_ATTR_NAME } = useCardRowState()

  const findTargetRowItem = (el: HTMLElement) => {
    if (!el.hasAttribute(CARD_ROW_ID_ATTR_NAME)) {
      el = el.closest(`div[${CARD_ROW_ID_ATTR_NAME}]`)!
    }
    const rowId = el.getAttribute(CARD_ROW_ID_ATTR_NAME)!
    return getCardRowContext(rowId)!.item.value as any
  }

  return { findTargetRowItem }
}
