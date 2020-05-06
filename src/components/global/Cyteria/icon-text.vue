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
  import vue_iconifyIcon from "../iconify-icon.vue";
  import vue_langText from "../lang-text.vue";
  import vue_svgIcon from "../svg-icon.vue";

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
    },
    components: {
      'iconify-icon': vue_iconifyIcon,
      'lang-text': vue_langText,
      'svg-icon': vue_svgIcon
    }
  }
</script>

<style lang="less" scoped>
  @deep-operator: ~'>>>';

  .-icon-text {
    display: inline-flex;
    align-items: center;

    &.line {
      width: 100%;
    }

    > span {
      display: inline-flex;
    }

    @{deep-operator} svg, > img {
      height: 1.2rem;
      width: 1.2rem;
      flex-shrink: 0;
      color: var(--primary-light-3);
      fill: currentcolor;
    }

    > svg + .text {
      margin-left: 0.4rem;
    }

    &.text-small {
      @{deep-operator} svg {
        height: 0.9rem
      }

      > svg + .text {
        margin-left: 0.2rem;
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