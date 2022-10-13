import { computed, reactive } from 'vue'

export interface PopperOptions {
  placement?: string
  autoSelect?: boolean
  custom?: boolean
  offset?: number
}

export function setupPopperOptions(options: PopperOptions = {}) {
  const defaultValueMapping = {
    placement: 'bottom-start',
    autoSelect: false,
    custom: false,
    offset: 6,
  }
  const _options: Record<string, any> = {}
  ;(
    Object.entries(defaultValueMapping) as [keyof PopperOptions, any][]
  ).forEach(([key, value]) => {
    _options[key] = computed(() =>
      options[key] === undefined ? value : options[key]
    )
  })
  return reactive(_options) as Required<PopperOptions>
}

export interface PopperHideEventDetail {
  eventTarget: Node | null
}

export function initCyPopper() {
  document.body.addEventListener(
    'click',
    (evt: MouseEvent) => {
      const customEvent = new CustomEvent<PopperHideEventDetail>(
        'cypopperhide',
        {
          detail: {
            eventTarget: evt.target as Node | null,
          },
        }
      )
      document
        .querySelectorAll('#app-popovers > .cy--popper')
        .forEach(el => el.dispatchEvent(customEvent))
    },
    { capture: true }
  )
}
