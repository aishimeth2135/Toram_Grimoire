<script>
import { h, mergeProps } from "vue";

import SimpleButton from "./button/simple";
import BorderButton from "./button/border";
import InlineButton from "./button/inline";
import LineButton from "./button/line";
import IconButton from "./button/icon";
import DropDownButton from "./button/drop-down";
import CheckButton from "./button/check";

import { ColorSetProps, getColorSetStyle } from "./base/color-set.vue";

function CyButton(props, context) {
  const getComponent = () => {
    const type = props.type;
    if (type === 'border') {
      return BorderButton;
    } else if (type === 'line') {
      return LineButton;
    } else if (type === 'icon') {
      return IconButton;
    } else if (type === 'drop-down') {
      return DropDownButton;
    } else if (type === 'inline') {
      return InlineButton;
    } else if (type === 'check') {
      return CheckButton;
    }
    return SimpleButton;
  }

  const attrs = mergeProps({
    class: ['Button'],
    style: getColorSetStyle(props)
  }, context.attrs);

  return h(
    getComponent(),
    attrs,
    context.slots
  )
}

CyButton.props = {
  type: {
    type: String,
    default: 'simple',
    validator(v){
      return [
        'simple', 'icon', 'line', 'border', 'drop-down', 'inline', 'check'
      ].includes(v);
    }
  },
  ...ColorSetProps
};

export default CyButton;
</script>
<style lang="postcss" scoped>
.Button {
  --icon-width: 1.2rem;
  --icon-color: var(--color-set--icon-color);
  --text-color: var(--color-set--text-color);
  --border-color: var(--color-set--border-color);

  @apply relative text-base flex-shrink-0 duration-300;

  &.p-0 {
    padding: 0;
  }
  &.border-0 {
    border: 0;
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
    opacity: 0.7;

    &::before {
      content: '';
      width: 100%;
      height: 100%;
      cursor: not-allowed;
      z-index: 10;
      display: inline-block;
      position: absolute;
      left: 0;
      top: 0;
    }
  }
<<<<<<< Updated upstream
  @colors: ~'dark', ~'light', ~'light-2', ~'light-3', ~'light-4', ~'purple',
    ~'red', ~'red-light', ~'water-blue', ~'water-blue-light',
    ~'gray', ~'gray-light', ~'orange', ~'orange-light', ~'green',
    ~'blue-green', ~'blue-green-light';
  @color-texts: ~'text', ~'icon', ~'border';
  each(@colors, .(@color) {
    each(@color-texts, .(@name) {
      &.@{name}-color-@{color} {
        --@{name}-color: ~'var(--primary-@{color})';
      }
      &.@{name}-color-hover-@{color} {
        --@{name}-color-hover: ~'var(--primary-@{color})';
      }
    })
  });
=======
>>>>>>> Stashed changes
}
</style>