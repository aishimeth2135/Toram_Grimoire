import {
  type ComputePositionConfig,
  type DetectOverflowOptions,
  autoUpdate,
  computePosition,
  flip,
  limitShift,
  offset,
  shift,
  size,
} from '@floating-ui/dom'
import {
  type CSSProperties,
  type Ref,
  computed,
  isRef,
  nextTick,
  ref,
  watch,
} from 'vue'

interface CreatePopperOptions {
  placement?: string
  autoSelect?: boolean
}

interface PopperHideEventDetail {
  eventTarget: Node | null
}

const HIDE_POPPER_EVENT_NAME = 'cypopperhide'

export function createPopover(
  main: HTMLElement | Ref<HTMLElement | null>,
  popper: HTMLElement | Ref<HTMLElement | null>,
  options: CreatePopperOptions = {}
) {
  const mainElement = isRef(main) ? main : { value: main }
  const popperElement = isRef(popper) ? popper : { value: popper }
  const shown = ref(false)
  const popperStyle: Ref<CSSProperties> = ref({})

  const overFlowOptions: Partial<DetectOverflowOptions> = {
    padding: 8,
    rootBoundary: 'viewport',
  }
  const baseOptions: Partial<ComputePositionConfig> = {
    strategy: 'fixed',
    middleware: [
      offset(6),
      flip({
        ...overFlowOptions,
        flipAlignment: false, // for size()
      }),
      shift({
        ...overFlowOptions,
        limiter: limitShift(),
      }),
      size({
        apply({ availableWidth, availableHeight }) {
          popperStyle.value = {
            ...popperStyle.value,
            maxWidth: `${Math.min(availableWidth, 480)}px`,
            maxHeight: `${availableHeight}px`,
          }
        },
        ...overFlowOptions,
      }),
    ],
  }

  const _options = computed(
    () =>
      ({
        placement: 'bottom-start',
        autoSelect: false,
        ...options,
      }) as Required<CreatePopperOptions>
  )

  const computePositionOptions = computed(() => {
    return {
      ...baseOptions,
      placement: options.placement,
    } as Partial<ComputePositionConfig>
  })

  const updatePosition = async () => {
    await nextTick()
    if (!mainElement.value || !popperElement.value) {
      return
    }
    const data = await computePosition(
      mainElement.value,
      popperElement.value,
      computePositionOptions.value
    )
    popperStyle.value = {
      ...popperStyle.value,
      left: `${data.x}px`,
      top: `${data.y}px`,
    }
  }

  const togglePopper = async (force?: boolean) => {
    shown.value = force ?? !shown.value

    if (shown.value) {
      await nextTick()
      if (!mainElement.value || !popperElement.value) {
        return
      }
      autoUpdate(mainElement.value, popperElement.value, updatePosition)
      if (_options.value.autoSelect) {
        popperElement.value.querySelector('input')?.select()
      }
    }
  }

  const handlePopperHide = ((evt: CustomEvent<PopperHideEventDetail>) => {
    if (
      evt.detail.eventTarget &&
      [mainElement.value, popperElement.value].some(el =>
        el?.contains(evt.detail.eventTarget)
      )
    ) {
      return
    }
    togglePopper(false)
  }) as EventListener

  popperElement.value?.addEventListener(
    HIDE_POPPER_EVENT_NAME,
    handlePopperHide
  )

  watch(_options, () => updatePosition())

  watch(popperStyle, () => {
    if (popperElement) {
      Object.entries(popperStyle).forEach(([key, value]) => {
        ;(popperElement.value!.style as any)[key] = value
      })
    }
  })

  if (isRef(main)) {
    watch(main, updatePosition)
  }
  if (isRef(popper)) {
    watch(popper, updatePosition)
  }
}
