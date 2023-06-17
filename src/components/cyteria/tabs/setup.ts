import { Ref, onUnmounted } from 'vue'
import { computed } from 'vue'

import { defineState } from '@/shared/setup/State'

interface TabsComponentContext {
  tabIndex: Ref<number>
  isHorizontal: Ref<boolean>
}

interface TabsRootContext extends TabsComponentContext {
  id: string
}

const useTabsContextState = defineState(() => {
  const contexts = new Map<string, TabsRootContext>()

  const TAB_ID_ATTR_NAME = 'data-tid'

  let currentId = 0
  const getNextId = () => {
    currentId += 1
    return currentId.toString()
  }

  const allocContext = (
    componentContext: TabsComponentContext
  ): TabsRootContext => {
    const id = getNextId()
    const context = {
      id,
      ...componentContext,
    }
    contexts.set(id, context)
    return context
  }

  const getTabsContext = (id: string) => {
    return contexts.get(id) ?? null
  }

  const deallocTabsContext = (id: string) => {
    return contexts.delete(id)
  }

  return {
    allocContext,
    getTabsContext,
    deallocTabsContext,
    TAB_ID_ATTR_NAME,
  }
})

export function useTabsContext(componentContext: TabsComponentContext) {
  const { allocContext, deallocTabsContext, TAB_ID_ATTR_NAME } =
    useTabsContextState()

  const context = allocContext(componentContext)

  onUnmounted(() => {
    deallocTabsContext(context.id)
  })

  return {
    context,
    idBind: {
      name: TAB_ID_ATTR_NAME,
      value: context.id,
    },
  }
}

export function useTabNavButton(
  sourceEl: Ref<HTMLElement | null>,
  tabIndex: Ref<number>
) {
  const { getTabsContext, TAB_ID_ATTR_NAME } = useTabsContextState()

  const getContext = () => {
    const tabsEl = sourceEl.value?.closest('.cy-tabs')
    if (!tabsEl) {
      return
    }
    const tid = tabsEl.getAttribute(TAB_ID_ATTR_NAME)!
    return getTabsContext(tid)
  }

  const setTabIndex = () => {
    const context = getContext()
    if (context) {
      context.tabIndex.value = tabIndex.value
    }
  }

  const tabSelected = computed(() => {
    const context = getContext()
    if (context) {
      return tabIndex.value === context.tabIndex.value
    }
    return false
  })

  return { setTabIndex, tabSelected, getParentTabsContext: getContext }
}
