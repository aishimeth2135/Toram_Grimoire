<script>
import { h } from "vue";

import SimpleButton from "./button/simple";
import BorderButton from "./button/border";
import LineButton from "./button/line";
import IconButton from "./button/icon";
import DropDownButton from "./button/drop-down";

const colorList = [
  'dark', 'light', 'light-2', 'light-3', 'light-4', 'purple',
  'red', 'red-light', 'water-blue', 'water-blue-light',
  'gray', 'gray-light', 'orange', 'green'
];

function C(props, context) {
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
    }
    return SimpleButton;
  }

  console.log(context);
  if (!context.attrs.class) {
    context.attrs.class = {};
  }
  context.attrs.class = {
    ...context.attrs.class,
    'Button': true,
    ['text-color-' + props.textColor]: true,
    ['icon-color-' + props.iconColor]: true,
    ['text-color-hover-' + props.textColorHover]: true,
    ['icon-color-hover-' + props.iconColorHover]: true
  };

  return h(
    getComponent(),
    context.attrs,
    context.slots
  )
}

C.props = {
  type: {
    type: String,
    default: 'simple',
    validator(v){
      return [
        'simple', 'icon', 'line', 'border', 'drop-down',
      ].includes(v);
    }
  },
  textColor: {
    type: String,
    default: 'dark',
    validator(v) {
      return colorList.includes(v);
    }
  },
  textColorHover: {
    type: String,
    default: 'light-4',
    validator(v) {
      return colorList.includes(v);
    }
  },
  iconColor: {
    type: String,
    default: 'light-2',
    validator(v) {
      return colorList.includes(v);
    }
  },
  iconColorHover: {
    type: String,
    default: 'light-4',
    validator(v) {
      return colorList.includes(v);
    }
  }
};

export default C;
</script>
<style lang="less" scoped>
.Button {
  --icon-width: 1.2rem;
  text-align: center;
  cursor: pointer;
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
    ~'gray', ~'gray-light', ~'orange', ~'green';
  each(@colors, {
    &.text-color-@{value} {
      --text-color: ~'var(--primary-@{value})';
    }
    &.icon-color-@{value} {
      --icon-color: ~'var(--primary-@{value})';
    }
    &.text-color-hover-@{value} {
      --text-color-hover: ~'var(--primary-@{value})';
    }
    &.icon-color-hover-@{value} {
      --icon-color-hover: ~'var(--primary-@{value})';
    }
  });

  // $colors: 'dark', 'light', 'light-2', 'light-3', 'light-4', 'purple',
  //   'red', 'red-light', 'water-blue', 'water-blue-light',
  //   'gray', 'gray-light', 'orange', 'green';
  // @each $value in $colors {
  //   &.text-color-#{$value} {
  //     --text-color: 'var(--primary-#{$value})';
  //   }
  //   &.icon-color-#{$value} {
  //     --icon-color: 'var(--primary-#{$value})';
  //   }
  //   &.text-color-hover-#{$value} {
  //     --text-color-hover: 'var(--primary-#{$value})';
  //   }
  //   &.icon-color-hover-#{$value} {
  //     --icon-color-hover: 'var(--primary-#{$value})';
  //   }
  // };
}
</style>