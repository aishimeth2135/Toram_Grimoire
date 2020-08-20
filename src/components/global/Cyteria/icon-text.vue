<template>
  <span class="cy--icon-text" :class="rootClass">
    <iconify-icon v-if="iconifyName != null" :name="iconifyName"></iconify-icon>
    <svg-icon v-if="iconId != null" :icon-id="iconId"></svg-icon>
    <lang-text v-if="textLangId != null" :lang-id="textLangId" class="text"></lang-text>
    <span v-else-if="$slots['default']" class="text">
      <slot></slot>
    </span>
    <slot name="extra"></slot>
  </span>
</template>

<script>
  export default {
    props: {
      iconifyName: {
        default: null
      },
      iconId: {
        default: null
      },
      textLangId: {
        default: null
      },
      textColor: {
        type: String,
        default: 'dark',
        validator(v) {
          return ['dark', 'light', 'light-2', 'light-3', 'light-4', 'purple'].includes(v);
        }
      },
      textSize: {
        type: String,
        default: 'normal',
        validator(v) {
          return ['normal', 'small'].includes(v);
        }
      }
    },
    computed: {
      rootClass() {
        return {
          ['text-color-' + this.textColor]: true,
          ['text-' + this.textSize]: true
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

    &.line {
      width: 100%;
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
    }

    > svg + .text {
      margin-left: var(--text-margin-left);
      color: var(--text-color);
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

    &.title {
      --text-color: var(--primary-purple);
      font-size: 1.2rem;
    }

    &.text-color-dark {
      --text-color: var(--primary-dark);
    }
    &.text-color-light-4 {
      --text-color: var(--primary-light-4);
    }
    &.text-color-light-3 {
      --text-color: var(--primary-light-3);
    }
    &.text-color-light-2 {
      --text-color: var(--primary-light-2);
    }
    &.text-color-light {
      --text-color: var(--primary-light);
    }
    &.text-color-purple {
      --text-color: var(--primary-purple);
    }
  }
</style>