<script>
import { h, mergeProps } from "vue";

import SimpleButton from "./button/simple";
import BorderButton from "./button/border";
import InlineButton from "./button/inline";
import LineButton from "./button/line";
import IconButton from "./button/icon";
import DropDownButton from "./button/drop-down";

import Color from "@services/Color";

const ColorList = Color.List;

function colorValidator(v) {
  return v === 'default' || v === '!default' || ColorList.includes(v);
}

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
    }
    return SimpleButton;
  }

  /**
   * @param {string} id
   * @param {string} defaultValue
   */
  const defaultProp = (id, defaultValue) => {
    if (props[key] === '!default') {
      props[key] = defaultValue;
      return;
    }
    const [name, type = ''] = id.split('/');
    const key = name + 'Color' + (type ? (type[0].toUpperCase() + type.slice(1)) : '');
    if (props[key] === 'default') {
      if (props.mainColor !== 'default') {
        const mc = props.mainColor;
        props[key] = type === 'hover' || name === 'text' ? mc : Color.lighten(mc);
      } else {
        props[key] = defaultValue;
      }
    }
  }

  defaultProp('text', 'dark');
  defaultProp('text/hover', 'light-4');
  defaultProp('icon', 'light-2');
  defaultProp('icon/hover', 'light-4');
  defaultProp('border', 'light');
  defaultProp('border/hover', 'light-3');

  const attrs = mergeProps({
    class: {
      'Button': true,
      ['text-color-' + props.textColor]: true,
      ['icon-color-' + props.iconColor]: true,
      ['border-color-' + props.borderColor]: true,
      ['text-color-hover-' + props.textColorHover]: true,
      ['icon-color-hover-' + props.iconColorHover]: true,
      ['border-color-hover-' + props.borderColorHover]: true,
    }
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
        'simple', 'icon', 'line', 'border', 'drop-down', 'inline'
      ].includes(v);
    }
  },
  textColor: {
    type: String,
    default: 'default',
    validator: colorValidator
  },
  textColorHover: {
    type: String,
    default: 'default',
    validator: colorValidator
  },
  iconColor: {
    type: String,
    default: 'default',
    validator: colorValidator
  },
  iconColorHover: {
    type: String,
    default: 'default',
    validator: colorValidator
  },
  borderColor: {
    type: String,
    default: 'default',
    validator: colorValidator
  },
  borderColorHover: {
    type: String,
    default: 'default',
    validator: colorValidator
  },
  mainColor: {
    type: String,
    default: 'default',
    validator: colorValidator
  }
};

export default CyButton;
</script>
<style lang="less" scoped>
.Button {
  --icon-width: 1.2rem;
  position: relative;
  flex-shrink: 0;

  @apply text-base;
  @apply duration-300;

  &.p-0 {
    padding: 0;
  }
  &.border-0 {
    border: 0;
  }

  ::v-deep(.button--text) {
    color: var(--text-color, var(--primary-dark));
    text-align: center;
  }

  &.button--main-content, ::v-deep(.button--main-content) {
    cursor: pointer;
    border-color: var(--border-color, var(--primary-light));

    &:hover, &.selected {
      --icon-color: var(--icon-color-hover);
      --text-color: var(--text-color-hover);
      --border-color: var(--border-color-hover);
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
  @colors: ~'dark', ~'light', ~'light-2', ~'light-3', ~'light-4', ~'purple',
    ~'red', ~'red-light', ~'water-blue', ~'water-blue-light',
    ~'gray', ~'gray-light', ~'orange', ~'green',
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
}
</style>