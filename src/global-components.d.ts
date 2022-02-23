import CyModal from '@/components/global/Cyteria/modal.vue'
import CyInputCounter from '@/components/global/Cyteria/input-counter.vue'
import CyListItem from '@/components/global/Cyteria/list-item.vue'
import CyIconText from '@/components/global/Cyteria/icon-text.vue'
import CyTitleInput from '@/components/global/Cyteria/title-input.vue'
import CyButton from '@/components/global/Cyteria/button.vue'
// import CyButtonIcon from '@/components/global/Cyteria/button/icon.vue'
// import CyButtonBorder from '@/components/global/Cyteria/button/border.vue'
// import CyButtonDropDown from '@/components/global/Cyteria/button/drop-down.vue'
// import CyButtonCheck from '@/components/global/Cyteria/button/check.vue'
// import CyButtonRadio from '@/components/global/Cyteria/button/radio.vue'
// import CyButtonCircle from '@/components/global/Cyteria/button/circle.vue'
// import CyButtonInline from '@/components/global/Cyteria/button/inline.vue'

declare module 'vue' {
  export interface GlobalComponents {
    CyModal: typeof CyModal;
    CyInputCounter: typeof CyInputCounter;
    CyListItem: typeof CyListItem;
    CyIconText: typeof CyIconText;
    CyTitleInput: typeof CyTitleInput;

    CyButton: typeof CyButton;
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
