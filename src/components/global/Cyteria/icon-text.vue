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
    --icon-color: var(--primary-light-3);
    --icon-width: 1.2rem;

    &.mr-normal {
      margin-right: 0.6rem;
    }

    &.line {
      width: 100%;
    }

    > span {
      display: inline-flex;
    }

    @{deep-operator} svg, img {
      height: var(--icon-width);
      width: var(--icon-width);
      flex-shrink: 0;
      color: var(--icon-color);
      fill: currentcolor;
    }

    > svg + .text {
      margin-left: 0.4rem;
    }

    &.text-small {
      --icon-width: 0.9rem;
      font-size: 0.9rem;

      > svg + .text {
        margin-left: 0.3rem;
      }

      > .text + .value {
        margin-left: 0.4rem;
      }
    }

    &.title {
      @{deep-operator} svg {
        height: 1.2rem;
      }

      > svg + .text {
        margin-left: 0.4rem;
        font-size: 1.2rem;
        color: var(--primary-purple);
      }

      > .text + .value {
        margin-left: 0.5rem;
      }
    }

    > .value {
      color: var(--primary-light-4);
    }

    > .text + .value {
      margin-left: 0.6rem;
    }
  }
</style>