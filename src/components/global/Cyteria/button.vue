<script>
import { h, mergeProps } from 'vue';

import { ColorSetProps, getColorSetStyle } from './base/color-set.vue';
import ButtonBorder from './button/border';
import ButtonCheck from './button/check';
import ButtonDropDown from './button/drop-down';
import ButtonIcon from './button/icon';
import ButtonInline from './button/inline';
import ButtonLine from './button/line';
import ButtonSimple from './button/simple';
import ButtonSwitch from './button/switch';

function CyButton(props, context) {
  const getComponent = () => {
    const type = props.type;
    if (type === 'border') {
      return ButtonBorder;
    } else if (type === 'line') {
      return ButtonLine;
    } else if (type === 'icon') {
      return ButtonIcon;
    } else if (type === 'drop-down') {
      return ButtonDropDown;
    } else if (type === 'inline') {
      return ButtonInline;
    } else if (type === 'check') {
      return ButtonCheck;
    } else if (type === 'switch') {
      return ButtonSwitch;
    }
    return ButtonSimple;
  };

  const attrs = mergeProps({
    class: ['cy--button-base'],
    style: getColorSetStyle(props),
  }, context.attrs);

  return h(
    getComponent(),
    attrs,
    context.slots,
  );
}

CyButton.props = {
  type: {
    type: String,
    default: 'simple',
    validator(v){
      return [
        'simple', 'icon', 'line', 'border', 'drop-down', 'inline', 'check', 'switch',
      ].includes(v);
    },
  },
  ...ColorSetProps,
};

export default CyButton;
</script>
<style lang="postcss" scoped>
.cy--button-base {
  --icon-width: 1.2rem;
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
    @apply p-0 m-0 border-0;
  }

  &::v-deep(.button--text) {
    color: var(--text-color, var(--primary-dark));
    text-align: center;
  }

  &.button--main-content, &::v-deep(.button--main-content) {
    cursor: pointer;
    border-color: var(--border-color, var(--primary-light));

    &:hover, &.selected {
      --icon-color: var(--color-set--icon-color-hover);
      --text-color: var(--color-set--text-color-hover);
      --border-color: var(--color-set--border-color-hover);
    }
  }

  &.disabled {
    &::after {
      content: '';
      width: 100%;
      height: 100%;
      cursor: not-allowed;
      z-index: 10;
      display: inline-block;
      position: absolute;
      left: 0;
      top: 0;
      @apply bg-white bg-opacity-50;
    }
  }

  &:not(.disabled):active {
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
