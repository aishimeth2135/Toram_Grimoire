<template>
  <span class="-icon-text">
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
      }
    }
  }
</script>

<style lang="less" scoped>
  @deep-operator: ~'>>>';

  .-icon-text {
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

    &.text-color-light-3 {
      --text-color: var(--primary-light-3);
    }
  }
</style>