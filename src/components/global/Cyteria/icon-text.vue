<template>
  <span class="cy--icon-text" :class="rootClass">
    <iconify-icon v-if="iconifyName != null" :name="iconifyName" />
    <svg-icon v-if="iconId != null" :icon-id="iconId" />
    <image-icon v-if="imagePath" :image-path="imagePath" />
    <lang-text v-if="textLangId != null" :lang-id="textLangId" class="text"></lang-text>
    <span v-else-if="$slots['default']" class="text">
      <slot></slot>
    </span>
    <slot name="extra"></slot>
  </span>
</template>

<script>
const colorList = [
  'dark', 'light', 'light-2', 'light-3', 'light-4', 'purple',
  'red', 'red-light', 'water-blue', 'water-blue-light',
  'gray', 'gray-light', 'orange', 'green'
];

export default {
  props: {
    iconifyName: {
      default: null
    },
    iconId: {
      default: null
    },
    imagePath: {
      default: null
    },
    textLangId: {
      default: null
    },
    textColor: {
      type: String,
      default: 'dark',
      validator(v) {
        return colorList.includes(v);
      }
    },
    textSize: {
      type: String,
      default: 'normal',
      validator(v) {
        return ['normal', 'small'].includes(v);
      }
    },
    iconColor: {
      type: String,
      default: 'light-2',
      validator(v) {
        return colorList.includes(v);
      }
    },
    display: {
      type: String,
      default: 'inline',
      validator(v) {
        return ['inline', 'block'].includes(v);
      }
    }
  },
  computed: {
    rootClass() {
      return {
        ['text-color-' + this.textColor]: true,
        ['text-' + this.textSize]: true,
        ['icon-color-' + this.iconColor]: true,
        ['display-' + this.display]: true
      };
    }
  }
}
</script>

<style lang="less" scoped>
  @deep-operator: ~'>>>';

  .cy--icon-text {
    display: inline-flex;
    align-items: center;
    --icon-color: var(--primary-light-2);
    --icon-width: 1.2rem;
    --text-color: var(--primary-dark);
    --text-margin-left: 0.4rem;
    --value-margin-left: 0.5rem;

    &.mr-normal {
      margin-right: 0.6rem;
    }
    &.mr-normal-2 {
      margin-right: 0.9rem;
    }

    &.line {
      width: 100%;
    }
    &.display-block {
      display: flex;
    }

    > span {
      display: inline-flex;
    }

    > svg, img {
      height: var(--icon-width);
      width: var(--icon-width);
      flex-shrink: 0;
      color: var(--icon-color);
      fill: currentcolor;

      & + .text {
        margin-left: var(--text-margin-left);
        color: var(--text-color);
        display: inline-flex;
        align-items: center;
      }
    }

    > .value {
      color: var(--primary-light-4);
    }

    > .text + .value {
      margin-left: var(--value-margin-left);
    }

    &.text-normal {
      font-size: 1rem;
    }
    &.text-small {
      --icon-width: 0.9rem;
      --text-margin-left: 0.3rem;
      --value-margin-left: 0.4rem;
      font-size: 0.9rem;
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
    });
  }
</style>