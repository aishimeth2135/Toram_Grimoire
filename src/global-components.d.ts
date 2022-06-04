import { RouterView, RouterLink } from 'vue-router'

import CyModal from '@/components/global/Cyteria/modal.vue'
import CyInputCounter from '@/components/global/Cyteria/input-counter.vue'
import CyListItem from '@/components/global/Cyteria/list-item.vue'
import CyIconText from '@/components/global/Cyteria/icon-text.vue'
import CyTitleInput from '@/components/global/Cyteria/title-input.vue'
import CyOptions from '@/components/global/Cyteria/options.vue'
import CyPopover from '@/components/global/Cyteria/popover.vue'
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
