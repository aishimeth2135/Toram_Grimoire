<template>
  <span class="cy--title-input">
    <div class="input-container">
      <span class="icon">
        <iconify-icon v-if="iconifyName === null" :name="iconifyName" />
        <svg-icon v-if="iconId !== null" :icon-id="iconId" />
      </span>
      <slot></slot>
    </div>
  </span>
</template>
<script>
export default {
  props: {
    iconifyName: {
      type: String,
      default: null
    },
    iconId: {
      type: String,
      default: null
    }
  }
}
</script>
<style lang="less" scoped>
@deep: ~'>>>';

.cy--title-input {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 0.4rem;
  margin-bottom: 0.8rem;

  > .icon-before-short {
    margin-right: 0.3rem;
    display: inline-block;
  }

  > .input-container {
    padding: 0.3rem;
    border: 0.1rem solid var(--primary-light);
    border-radius: 0.8rem;
    min-width: 18.5rem;
    margin: 0.5rem;
    display: flex;
    align-items: center;

    @media screen and (max-width: 24rem) {
      width: 100%;
    }

    &.input-focus {
      border-color: var(--primary-light-3);
    }

    > .icon {
      margin-left: 0.4rem;
      margin-right: -1.8rem;
      margin-top: 0.2rem;

      @{deep} svg {
        color: var(--primary-light);
        width: 1.3rem;
        height: 1.3rem;
      }
    }

    > input {
      padding: 0.2rem;
      border: 0;
      transition: 0.3s;
      font-size: 1rem;
      width: 100%;
      padding-left: 2.6rem;
    }
  }
}
</style>