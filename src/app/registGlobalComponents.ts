import type { App } from 'vue'

import CyButtonAction from '@/components/global/Cyteria/cy-button/cy-button-action.vue'
import CyButtonCircle from '@/components/global/Cyteria/cy-button/cy-button-circle.vue'
import CyButtonPlain from '@/components/global/Cyteria/cy-button/cy-button-plain.vue'
import CyButtonCheck from '@/components/global/Cyteria/cy-button/cy-button-check.vue'
import CyButtonRadio from '@/components/global/Cyteria/cy-button/cy-button-radio.vue'
import CyButtonRadioGroup from '@/components/global/Cyteria/cy-button/cy-button-radio-group.vue'
import CyButtonToggle from '@/components/global/Cyteria/cy-button/cy-button-toggle.vue'
import CyButtonIcon from '@/components/global/Cyteria/cy-button/cy-button-icon.vue'
import CyButtonDropdown from '@/components/global/Cyteria/cy-button/cy-button-dropdown.vue'
import CyDefaultTips from '@/components/global/Cyteria/cy-default-tips.vue'
import CyDetailWindow from '@/components/global/Cyteria/detail-window.vue'
import CyHoverFloat from '@/components/global/Cyteria/hover-float.vue'
import CyHr from '@/components/global/Cyteria/hr.vue'
import CyIconText from '@/components/global/Cyteria/icon-text.vue'
import CyIcon from '@/components/global/Cyteria/icon.vue'
import CyInputCounter from '@/components/global/Cyteria/cy-input-counter.vue'
import CyListItem from '@/components/global/Cyteria/cy-list-item.vue'
import CyModal from '@/components/global/Cyteria/cy-modal.vue'
import CyOptions from '@/components/global/Cyteria/cy-options.vue'
import CyPagination from  '@/components/global/Cyteria/pagination.vue'
import CyStickyHeader from '@/components/global/Cyteria/sticky-header.vue'
import CyTitleInput from '@/components/global/Cyteria/cy-title-input.vue'
import CyTopHeaderMenu from '@/components/global/Cyteria/top-header-menu.vue'
import CyTopHeader from '@/components/global/Cyteria/top-header.vue'
import CyPopover from '@/components/global/Cyteria/cy-popover.vue'
import CyTransitionGroup from '@/components/global/Cyteria/transition-group.vue'
import CyTransition from '@/components/global/Cyteria/cy-transition.vue'
import ImageIcon from '@/components/global/image-icon.vue'
import SvgIcon from '@/components/global/svg-icon.vue'

export default function (app: App<Element>) {
  app.component('cy-default-tips', CyDefaultTips)
  app.component('cy-detail-window', CyDetailWindow)
  app.component('cy-hover-float', CyHoverFloat)
  app.component('cy-hr', CyHr)
  app.component('cy-icon-text', CyIconText)
  app.component('cy-icon', CyIcon)
  app.component('cy-input-counter', CyInputCounter)
  app.component('cy-list-item', CyListItem)
  app.component('cy-modal', CyModal)
  app.component('cy-options', CyOptions)
  app.component('cy-pagination', CyPagination)
  app.component('cy-sticky-header', CyStickyHeader)
  app.component('cy-title-input', CyTitleInput)
  app.component('cy-top-header-menu', CyTopHeaderMenu)
  app.component('cy-top-header', CyTopHeader)
  app.component('cy-popover', CyPopover)
  app.component('cy-transition-group', CyTransitionGroup)
  app.component('cy-transition', CyTransition)
  app.component('image-icon', ImageIcon)
  app.component('svg-icon', SvgIcon)

  app.component('cy-button-action', CyButtonAction)
  app.component('cy-button-circle', CyButtonCircle)
  app.component('cy-button-plain', CyButtonPlain)
  app.component('cy-button-check', CyButtonCheck)
  app.component('cy-button-radio', CyButtonRadio)
  app.component('cy-button-radio-group', CyButtonRadioGroup)
  app.component('cy-button-toggle', CyButtonToggle)
  app.component('cy-button-icon', CyButtonIcon)
  app.component('cy-button-dropdown', CyButtonDropdown)
}
