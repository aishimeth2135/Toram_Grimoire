import type { App } from 'vue'

import CyButtonAction from '@/components/cyteria/cy-button/cy-button-action.vue'
import CyButtonCheck from '@/components/cyteria/cy-button/cy-button-check.vue'
import CyButtonCircle from '@/components/cyteria/cy-button/cy-button-circle.vue'
import CyButtonDropdown from '@/components/cyteria/cy-button/cy-button-dropdown.vue'
import CyButtonIcon from '@/components/cyteria/cy-button/cy-button-icon.vue'
import CyButtonPlain from '@/components/cyteria/cy-button/cy-button-plain.vue'
import CyButtonRadioGroup from '@/components/cyteria/cy-button/cy-button-radio-group.vue'
import CyButtonRadio from '@/components/cyteria/cy-button/cy-button-radio.vue'
import CyButtonToggle from '@/components/cyteria/cy-button/cy-button-toggle.vue'
import CyDefaultTips from '@/components/cyteria/cy-default-tips.vue'
import CyHoverFloat from '@/components/cyteria/cy-hover-float.vue'
import CyHr from '@/components/cyteria/cy-hr.vue'
import CyIconText from '@/components/cyteria/cy-icon-text.vue'
import CyIcon from '@/components/cyteria/cy-icon.vue'
import CyInputCounter from '@/components/cyteria/cy-input-counter.vue'
import CyListItem from '@/components/cyteria/cy-list-item.vue'
import CyLoadingContent from '@/components/cyteria/cy-loading-content.vue'
import CyModal from '@/components/cyteria/cy-modal.vue'
import CyOptions from '@/components/cyteria/cy-options.vue'
import CyPagination from '@/components/cyteria/cy-pagination.vue'
import CyPopover from '@/components/cyteria/cy-popover/cy-popover.vue'
import { initCyPopper } from '@/components/cyteria/cy-popover/setup'
import CyTitleInput from '@/components/cyteria/cy-title-input.vue'
import CyTopHeader from '@/components/cyteria/cy-top-header.vue'
import CyTransition from '@/components/cyteria/cy-transition.vue'
import SvgIcon from '@/components/cyteria/icon/svg-icon.vue'

export default function (app: App<Element>) {
  app.component('cy-default-tips', CyDefaultTips)
  app.component('cy-hover-float', CyHoverFloat)
  app.component('cy-hr', CyHr)
  app.component('cy-icon', CyIcon)
  app.component('cy-icon-text', CyIconText)
  app.component('cy-input-counter', CyInputCounter)
  app.component('cy-list-item', CyListItem)
  app.component('cy-modal', CyModal)
  app.component('cy-options', CyOptions)
  app.component('cy-pagination', CyPagination)
  app.component('cy-title-input', CyTitleInput)
  app.component('cy-top-header', CyTopHeader)
  app.component('cy-popover', CyPopover)
  app.component('cy-transition', CyTransition)
  app.component('cy-loading-content', CyLoadingContent)

  app.component('cy-button-action', CyButtonAction)
  app.component('cy-button-circle', CyButtonCircle)
  app.component('cy-button-plain', CyButtonPlain)
  app.component('cy-button-check', CyButtonCheck)
  app.component('cy-button-radio', CyButtonRadio)
  app.component('cy-button-radio-group', CyButtonRadioGroup)
  app.component('cy-button-toggle', CyButtonToggle)
  app.component('cy-button-icon', CyButtonIcon)
  app.component('cy-button-dropdown', CyButtonDropdown)

  app.component('svg-icon', SvgIcon)

  initCyPopper()
}
