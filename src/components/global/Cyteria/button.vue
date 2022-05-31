<script lang="ts">
import { defineComponent, h, mergeProps, computed, toRefs } from 'vue'

import ButtonBorder from './button/border.vue'
import ButtonCheck from './button/check.vue'
import ButtonRadio from './button/radio.vue'
import ButtonDropDown from './button/drop-down.vue'
import ButtonIcon from './button/icon.vue'
import ButtonInline from './button/inline.vue'
import ButtonLine from './button/line.vue'
import ButtonSimple from './button/simple.vue'
import ButtonSwitch from './button/switch.vue'
import ButtonCircle from './button/circle.vue'

import { ColorSetProps, setupColorSetStyles } from './setup/color-set'

export default defineComponent({
  name: 'CyButton',
  props: {
    type: {
      type: String,
      default: 'simple',
      validator: (value: string) => {
        return [
          'simple', 'icon', 'line', 'border', 'drop-down', 'inline', 'check', 'switch', 'radio', 'circle',
        ].includes(value)
      },
    },
    iconWidth: {
      type: String,
      default: null,
    },
    hideFocus: {
      type: Boolean,
      default: false,
    },
    ...ColorSetProps,
  },
  setup(props) {
    const { colorSetStyles } = setupColorSetStyles(props)
    const { type: buttonType, iconWidth, hideFocus } = toRefs(props)
    const currentComponent = computed(() => {
      const type = buttonType.value
      if (type === 'border') {
        return ButtonBorder
      } else if (type === 'line') {
        return ButtonLine
      } else if (type === 'icon') {
        return ButtonIcon
      } else if (type === 'drop-down') {
        return ButtonDropDown
      } else if (type === 'inline') {
        return ButtonInline
      } else if (type === 'check') {
        return ButtonCheck
      } else if (type === 'radio') {
        return ButtonRadio
      } else if (type === 'switch') {
        return ButtonSwitch
      } else if (type === 'circle') {
        return ButtonCircle
      }
      return ButtonSimple
    })

    const resultProps = computed(() => {
      const style = {
        ...colorSetStyles.value,
      }
      if (iconWidth.value !== null) {
        style['--icon-width'] = iconWidth.value
      }
      return {
        class: {
          'cy--button-base': true,
          'focus-enabled': !hideFocus.value,
        },
        style,
      }
    })

    return {
      colorSetStyles,
      currentComponent,
      resultProps,
    }
  },
  render() {
    const attrs = mergeProps(this.resultProps, this.$attrs)
    return h(
      this.currentComponent,
      attrs,
      this.$slots,
    )
  },
})

// const CyButton: FunctionalComponent<ExtractPropTypes<typeof Props>> = (props, context) => {
//   const getComponent = () => {
//     const type = props.type;
//     if (type === 'border') {
//       return ButtonBorder;
//     } else if (type === 'line') {
//       return ButtonLine;
//     } else if (type === 'icon') {
//       return ButtonIcon;
//     } else if (type === 'drop-down') {
//       return ButtonDropDown;
//     } else if (type === 'inline') {
//       return ButtonInline;
//     } else if (type === 'check') {
//       return ButtonCheck;
//     } else if (type === 'radio') {
//       return ButtonRadio;
//     } else if (type === 'switch') {
//       return ButtonSwitch;
//     } else if (type === 'circle') {
//       return ButtonCircle;
//     }
//     return ButtonSimple;
//   };

//   const resultProps = {
//     class: ['cy--button-base'],
//     style: getColorSetStyles(props),
//   };
//   if (props.iconWidth !== null) {
//     resultProps.style['--icon-width'] = props.iconWidth;
//   }
//   const attrs = mergeProps(resultProps, context.attrs);

//   return h(
//     getComponent(),
//     attrs,
//     context.slots,
//   );
// };

// CyButton.props = Props;

// export default CyButton;
</script>

<style lang="postcss" scoped>
.cy--button-base {
  --icon-width: 1.125rem;
  --icon-color: var(--color-set--icon-color);
  --text-color: var(--color-set--text-color);
  --border-color: var(--color-set--border-color);

  user-select: none;

  @apply relative text-base flex-shrink-0 duration-300;

  &.p-0 {
    padding: 0;
  }
  &.border-0 {
    border: 0;
  }

  &.inline {
    margin: 0;
    padding: 0;
    border: 0;
  }

  & :deep(.button--text) {
    @apply text-center;
    color: var(--text-color, var(--app-dark));
  }

  &.button--main-content, & :deep(.button--main-content) {
    cursor: pointer;
    border-color: var(--border-color, var(--app-light));

    &:hover, &.selected {
      --icon-color: var(--color-set--icon-color-hover);
      --text-color: var(--color-set--text-color-hover);
      --border-color: var(--color-set--border-color-hover);
    }
  }

  &.disabled {
    @apply cursor-not-allowed opacity-40;
  }

  &.focus-enabled:not(.disabled):focus {
    &::before {
      content: '';
      width: calc(100% + 0.5rem);
      height: calc(100% + 0.5rem);
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      animation: button-active ease 0.2s forwards;

      @apply bg-light absolute inline-block rounded-full -z-1;
    }
  }
}

@keyframes button-active {
  from {
    @apply bg-opacity-20;
  }
  to {
    @apply bg-opacity-40;
  }
}
</style>
