import { RouterView, RouterLink } from 'vue-router'

import CyModal from '@/components/global/Cyteria/modal.vue'
import CyInputCounter from '@/components/global/Cyteria/input-counter.vue'
import CyListItem from '@/components/global/Cyteria/list-item.vue'
import CyIconText from '@/components/global/Cyteria/icon-text.vue'
import CyTitleInput from '@/components/global/Cyteria/title-input.vue'
import CyOptions from '@/components/global/Cyteria/options.vue'
import CyPopover from '@/components/global/Cyteria/popover.vue'
import CyButton from '@/components/global/Cyteria/button.vue'
import CyButtonAction from '@/components/global/Cyteria/cy-button/cy-button-action.vue'
import CyButtonCircle from '@/components/global/Cyteria/cy-button/cy-button-circle.vue'
import CyButtonPlain from '@/components/global/Cyteria/cy-button/cy-button-plain.vue'
// import CyButtonIcon from '@/components/global/Cyteria/button/icon.vue'
// import CyButtonBorder from '@/components/global/Cyteria/button/border.vue'
// import CyButtonDropDown from '@/components/global/Cyteria/button/drop-down.vue'
// import CyButtonCheck from '@/components/global/Cyteria/button/check.vue'
// import CyButtonRadio from '@/components/global/Cyteria/button/radio.vue'
// import CyButtonCircle from '@/components/global/Cyteria/button/circle.vue'
// import CyButtonInline from '@/components/global/Cyteria/button/inline.vue'


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

    CyButton: typeof CyButton;
    CyButtonAction: typeof CyButtonAction;
    CyButtonCircle: typeof CyButtonCircle;
    CyButtonPlain: typeof CyButtonPlain;
    // CyButtonIcon: typeof CyButtonIcon;
    // CyButtonLine: typeof CyButton;
    // CyButtonDropDown: typeof CyButtonDropDown;
    // CyButtonBorder: typeof CyButtonBorder;
    // CyButtonCheck: typeof CyButtonCheck;
    // CyButtonRadio: typeof CyButtonRadio;
    // CyButtonCircle: typeof CyButtonCircle;
    // CyButtonInline: typeof CyButtonInline;
  }
}
