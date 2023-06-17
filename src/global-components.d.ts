import { RouterLink, RouterView } from 'vue-router'

import CyButtonAction from '@/components/cyteria/cy-button/cy-button-action.vue'
import CyButtonCheck from '@/components/cyteria/cy-button/cy-button-check.vue'
import CyButtonCircle from '@/components/cyteria/cy-button/cy-button-circle.vue'
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
import CyTitleInput from '@/components/cyteria/cy-title-input.vue'
import CyTopHeader from '@/components/cyteria/cy-top-header.vue'
import CyTransition from '@/components/cyteria/cy-transition.vue'
import CyTab from '@/components/cyteria/tabs/cy-tab.vue'
import CyTabs from '@/components/cyteria/tabs/cy-tabs.vue'

declare module 'vue' {
  export interface GlobalComponents {
    RouterView: typeof RouterView
    RouterLink: typeof RouterLink

    CyModal: typeof CyModal
    CyInputCounter: typeof CyInputCounter
    CyListItem: typeof CyListItem
    CyIcon: typeof CyIcon
    CyIconText: typeof CyIconText
    CyTitleInput: typeof CyTitleInput
    CyOptions: typeof CyOptions
    CyPopover: typeof CyPopover
    CyDefaultTips: typeof CyDefaultTips
    CyTransition: typeof CyTransition
    CyPagination: typeof CyPagination
    CyTopHeader: typeof CyTopHeader
    CyHoverFloat: typeof CyHoverFloat
    CyLoadingContent: typeof CyLoadingContent
    CyHr: typeof CyHr

    CyButtonAction: typeof CyButtonAction
    CyButtonCircle: typeof CyButtonCircle
    CyButtonPlain: typeof CyButtonPlain
    CyButtonCheck: typeof CyButtonCheck
    CyButtonRadio: typeof CyButtonRadio
    CyButtonRadioGroup: typeof CyButtonRadioGroup
    CyButtonToggle: typeof CyButtonToggle
    CyButtonIcon: typeof CyButtonIcon

    CyTabs: typeof CyTabs
    CyTab: typeof CyTab
  }
}
