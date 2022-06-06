import { RouterView, RouterLink } from 'vue-router'

import CyModal from '@/components/global/Cyteria/cy-modal.vue'
import CyInputCounter from '@/components/global/Cyteria/cy-input-counter.vue'
import CyListItem from '@/components/global/Cyteria/cy-list-item.vue'
import CyIconText from '@/components/global/Cyteria/icon-text.vue'
import CyTitleInput from '@/components/global/Cyteria/cy-title-input.vue'
import CyOptions from '@/components/global/Cyteria/cy-options.vue'
import CyPopover from '@/components/global/Cyteria/cy-popover.vue'
import CyDefaultTips from '@/components/global/Cyteria/cy-default-tips.vue'
import CyTransition from '@/components/global/Cyteria/cy-transition.vue'
import CyButtonAction from '@/components/global/Cyteria/cy-button/cy-button-action.vue'
import CyButtonCircle from '@/components/global/Cyteria/cy-button/cy-button-circle.vue'
import CyButtonPlain from '@/components/global/Cyteria/cy-button/cy-button-plain.vue'
import CyButtonCheck from '@/components/global/Cyteria/cy-button/cy-button-check.vue'
import CyButtonRadio from '@/components/global/Cyteria/cy-button/cy-button-radio.vue'
import CyButtonRadioGroup from '@/components/global/Cyteria/cy-button/cy-button-radio-group.vue'
import CyButtonToggle from '@/components/global/Cyteria/cy-button/cy-button-toggle.vue'
import CyButtonIcon from '@/components/global/Cyteria/cy-button/cy-button-icon.vue'

declare module 'vue' {
  export interface GlobalComponents {
    RouterView: typeof RouterView;
    RouterLink: typeof RouterLink;

    CyModal: typeof CyModal;
    CyInputCounter: typeof CyInputCounter;
    CyListItem: typeof CyListItem;
    CyIconText: typeof CyIconText;
    CyTitleInput: typeof CyTitleInput;
    CyOptions: typeof CyOptions;
    CyPopover: typeof CyPopover;
    CyDefaultTips: typeof CyDefaultTips;
    CyTransition: typeof CyTransition;

    CyButtonAction: typeof CyButtonAction;
    CyButtonCircle: typeof CyButtonCircle;
    CyButtonPlain: typeof CyButtonPlain;
    CyButtonCheck: typeof CyButtonCheck;
    CyButtonRadio: typeof CyButtonRadio;
    CyButtonRadioGroup: typeof CyButtonRadioGroup;
    CyButtonToggle: typeof CyButtonToggle;
    CyButtonIcon: typeof CyButtonIcon;
  }
}
