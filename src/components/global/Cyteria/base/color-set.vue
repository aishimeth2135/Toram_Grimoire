<script>
import Color from '@services/Color';

const ColorList = Color.List;

function colorValidator(v) {
  return v === 'default' || v === '!default' || ColorList.includes(v);
}

const ColorSetProps = {
  textColor: {
    type: String,
    default: 'default',
    validator: colorValidator,
  },
  textColorHover: {
    type: String,
    default: 'default',
    validator: colorValidator,
  },
  iconColor: {
    type: String,
    default: 'default',
    validator: colorValidator,
  },
  iconColorHover: {
    type: String,
    default: 'default',
    validator: colorValidator,
  },
  borderColor: {
    type: String,
    default: 'default',
    validator: colorValidator,
  },
  borderColorHover: {
    type: String,
    default: 'default',
    validator: colorValidator,
  },
  mainColor: {
    type: String,
    default: 'default',
    validator: colorValidator,
  },
};

function getColorSetStyle(src) {
  const KEYS = [
    'textColor', 'textColorHover',
    'iconColor', 'iconColorHover',
    'borderColor', 'borderColorHover',
    'mainColor',
  ];

  const props = {};

  KEYS.forEach(key => props[key] = src[key]);

  /**
   * @param {string} id
   * @param {string} defaultValue
   */
  const defaultProp = (id, defaultValue) => {
    const [name, type = ''] = id.split('/');
    const key = name + 'Color' + (type ? (type[0].toUpperCase() + type.slice(1)) : '');
    if (props[key] === '!default') {
      props[key] = defaultValue;
      return;
    }
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

  const handleColor = color => `var(--primary-${color})`;

  return {
    '--color-set--text-color': handleColor(props.textColor),
    '--color-set--icon-color': handleColor(props.iconColor),
    '--color-set--border-color': handleColor(props.borderColor),
    '--color-set--text-color-hover': handleColor(props.textColorHover),
    '--color-set--icon-color-hover': handleColor(props.iconColorHover),
    '--color-set--border-color-hover': handleColor(props.borderColorHover),
  };
}

export { ColorSetProps, getColorSetStyle };

export default {
  props: ColorSetProps,
  computed: {
    colorSetStyle() {
      return getColorSetStyle(this);
    },
  },
};
</script>
<style lang="less" scoped>
// .cy--base--color-content {
//   @colors: ~'dark', ~'light', ~'light-2', ~'light-3', ~'light-4', ~'purple',
//     ~'red', ~'red-light', ~'water-blue', ~'water-blue-light',
//     ~'gray', ~'gray-light', ~'orange', ~'orange-light', ~'green',
//     ~'blue-green', ~'blue-green-light';
//   @color-texts: ~'text', ~'icon', ~'border';
//   each(@colors, .(@color) {
//     each(@color-texts, .(@name) {
//       &.@{name}-color-@{color} {
//         --@{name}-color: ~'var(--primary-@{color})';
//       }
//       &.@{name}-color-hover-@{color} {
//         --@{name}-color-hover: ~'var(--primary-@{color})';
//       }
//     })
//   });
// }
</style>
