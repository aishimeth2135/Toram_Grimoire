import { type Ref, type StyleValue, computed, onUnmounted, watch } from 'vue'

import {
  type ContextId,
  getContextIdFromElement,
  useContext,
} from '@/shared/setup/ContextState'
import { defineState } from '@/shared/setup/State'
import { nextFrame } from '@/shared/utils/dom'

interface TabsComponentContext {
  isHorizontal: Ref<boolean>
  currentValue: Ref<any>
}

const useTabsContextState = defineState(() => {
  const TABS_ID_ATTR_NAME = 'data-tid'

  const {
    allocContext: allocTabsContext,
    deallocContext: deallocTabsContext,
    getContext: getTabsContext,
  } = useContext<TabsComponentContext>()

  return {
    allocTabsContext,
    getTabsContext,
    deallocTabsContext,
    TABS_ID_ATTR_NAME,
  }
})

export function useTabsContext(componentContext: TabsComponentContext) {
  const { allocTabsContext, deallocTabsContext, TABS_ID_ATTR_NAME } =
    useTabsContextState()

  const { id, context } = allocTabsContext(componentContext)

  onUnmounted(() => {
    deallocTabsContext(id)
  })

  return {
    context,
    idBind: {
      name: TABS_ID_ATTR_NAME,
      value: id,
    },
  }
}

interface TabComponentContext {
  sourceEl: Ref<HTMLElement | null>
  tabValue: Ref<any>
}

const useTabContextState = defineState(() => {
  const TAB_ID_ATTR_NAME = 'data-nid'

  const {
    allocContext: allocTabContext,
    deallocContext: deallocTabContext,
    getContext: getTabContext,
  } = useContext<TabComponentContext>()

  return {
    allocTabContext,
    getTabContext,
    deallocTabContext,
    TAB_ID_ATTR_NAME,
  }
})

export function useTabContext(componentContext: TabComponentContext) {
  const { allocTabContext, deallocTabContext, TAB_ID_ATTR_NAME } =
    useTabContextState()

  const { id, context: tabContext } = allocTabContext(componentContext)
  const { sourceEl, tabValue } = tabContext

  onUnmounted(() => {
    deallocTabContext(id)
  })

  const { getTabsContext: _getTabsContext, TABS_ID_ATTR_NAME } =
    useTabsContextState()

  const getTabsContext = () => {
    const tabsEl = sourceEl.value?.closest('.cy-tabs')
    if (!tabsEl) {
      return
    }
    const tid = parseInt(
      tabsEl.getAttribute(TABS_ID_ATTR_NAME)!,
      10
    ) as ContextId
    return _getTabsContext(tid)
  }

  const updateTabValue = () => {
    const context = getTabsContext()
    if (context) {
      context.currentValue.value = tabValue.value
    }
  }

  const tabSelected = computed(() => {
    const context = getTabsContext()
    if (context) {
      return tabValue.value === context.currentValue.value
    }
    return false
  })

  // const _getTabIndex = (value: any, context?: TabsRootContext | null) => {
  //   if (context) {
  //     if (context.items.value) {
  //       return context.items.value.indexOf(value)
  //     }
  //     return normalizeInteger(value)
  //   }
  //   return -1
  // }

  // const currentTabIndex = computed(() => {
  //   const context = getContext()
  //   if (context) {
  //     return _getTabIndex(context.currentValue.value, context)
  //   }
  //   return -1
  // })

  // const getTabIndex = (value: any) => _getTabIndex(value, getContext())

  return {
    updateTabValue,
    tabSelected,
    getParentTabsContext: getTabsContext,
    idBind: {
      name: TAB_ID_ATTR_NAME,
      value: id,
    },
  }
}

interface WatchTabsValueContext extends TabsComponentContext {
  tabsEl: Ref<HTMLElement | null>
  sliderStyle: Ref<StyleValue | undefined>
}

export const useTabsSlider = defineState(() => {
  const { TAB_ID_ATTR_NAME, getTabContext } = useTabContextState()

  const findTab = (tabsEl: HTMLElement, value: any) => {
    const tabEls = Array.from(
      tabsEl.querySelectorAll(`div[${TAB_ID_ATTR_NAME}]`)
    )
    const el =
      tabEls.find(tabEl => {
        const tabId = getContextIdFromElement(tabEl, TAB_ID_ATTR_NAME)
        const tabContext = getTabContext(tabId)
        return tabContext && tabContext.tabValue.value === value
      }) ?? null
    return el as HTMLElement | null
  }

  const getSliderNextStyle = (
    tabsEl: HTMLElement,
    isHorizontal: boolean,
    fromEl: HTMLElement | null,
    toEl: HTMLElement
  ) => {
    const tabsRect = tabsEl.getBoundingClientRect()
    const toRect = toEl.getBoundingClientRect()
    const fromRect = fromEl?.getBoundingClientRect()

    const dirAttr = isHorizontal ? 'left' : 'top'
    const sliderDirAttr = isHorizontal ? 'bottom' : 'right'
    const scaleAttr = isHorizontal ? 'width' : 'height'
    const rscaleAttr = isHorizontal ? 'height' : 'width'

    let prevStyle = null

    const offset = fromRect ? Math.abs(toRect[dirAttr] - fromRect[dirAttr]) : 0
    const duration = offset ? Math.max(offset / 2, 200) : 0

    const nextStyle = {
      [scaleAttr]: `${toRect[scaleAttr]}px`,
      [dirAttr]: `${toRect[dirAttr] - tabsRect[dirAttr]}px`,
      [sliderDirAttr]: `calc(${
        tabsRect[sliderDirAttr] - toRect[sliderDirAttr]
      }px - 0.125rem)`,
      [rscaleAttr]: '0.25rem',
      'transition-duration': `${duration}ms`,
    }

    if (fromRect) {
      if (fromRect[sliderDirAttr] !== toRect[sliderDirAttr]) {
        prevStyle = {
          ...nextStyle,
          transition: '0s',
          [scaleAttr]: '0',
        }
      }
    }

    return {
      prevStyle,
      nextStyle,
    }
  }

  const autoUpdateSliderStyle = (watchContext: WatchTabsValueContext) => {
    const { currentValue, tabsEl, isHorizontal, sliderStyle } = watchContext

    watch(currentValue, (newValue, oldValue) => {
      if (!tabsEl.value) {
        return
      }
      const toEl = findTab(tabsEl.value, newValue)
      if (!toEl) {
        return
      }
      const fromEl = findTab(tabsEl.value, oldValue)
      const { prevStyle, nextStyle } = getSliderNextStyle(
        tabsEl.value,
        isHorizontal.value,
        fromEl,
        toEl
      )
      if (prevStyle) {
        sliderStyle.value = prevStyle
        nextFrame(() => (sliderStyle.value = nextStyle))
      } else {
        sliderStyle.value = nextStyle
      }
    })

    const forceUpdateSliderStyle = () => {
      if (!tabsEl.value) {
        return
      }
      const tabEl = findTab(tabsEl.value, currentValue.value)
      if (!tabEl) {
        return
      }
      const { nextStyle } = getSliderNextStyle(
        tabsEl.value,
        isHorizontal.value,
        null,
        tabEl
      )
      sliderStyle.value = nextStyle
    }

    return { forceUpdateSliderStyle }
  }

  return {
    autoUpdateSliderStyle,
  }
})
