<template>
  <span class="cy--title-input">
    <span class="icon">
      <iconify-icon v-if="iconifyName != null" :name="iconifyName"></iconify-icon>
      <svg-icon v-if="iconId != null" :icon-id="iconId"></svg-icon>
    </span>
    <slot></slot>
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
    }
  }
}
</script>
<style lang="less" scoped>
.cy--title-input {
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 0.4rem;
  margin-bottom: 0.8rem;

  > .icon {
    margin-left: 0.4rem;
    margin-right: -1.8rem;
    margin-top: 0.2rem;

    > svg {
      color: var(--primary-light);
      width: 1.3rem;
      height: 1.3rem;
    }
  }

  > .icon-before-short {
    margin-right: 0.3rem;
    display: inline-block;
  }

  > input {
    padding: 0.4rem;
    border: 0;
    border-bottom: 1px solid var(--primary-light);
    transition: 0.3s;
    font-size: 1rem;
    width: 18.5rem;
    margin-right: 0.5rem;
    padding-left: 2.6rem;
  }

  > input:focus {
    border-bottom-color: var(--primary-light-3);
  }

  input.short {
    width: 3rem;
    text-align: center;
    vertical-align: middle;
    padding: 0.3rem 0.6rem;
  }

  > .title {
    color: var(--primary-light-4);
    padding: 0.4rem 0.2rem;
  }

  > .text.inner {
    margin: 0 0.3rem;
    display: inline-block;
  }
}

@media screen and (max-width: 24rem) {
  .title-input>input {
    width: 100%;
  }
}
</style>