<template>
  <span class="flex items-center flex-wrap my-2 mx-1">
    <div
      class="input-container flex items-center py-1 px-3 border-1 border-solid border-light rounded-3xl w-full duration-300 bg-white"
      :class="{ 'input-focus': inputFocus }"
    >
      <cy-icon-text :icon="icon" :icon-src="iconSrc" class="mr-2" />
      <div ref="input-content" class="input-content w-full">
        <slot />
        <input
          v-if="!$slots.default"
          type="text"
          :value="value"
          :placeholder="placeholder"
          @focus="toggleInputFocus(true)"
          @blur="toggleInputFocus(false)"
          @input="updateValue"
        >
      </div>
    </div>
  </span>
</template>
<script>
import IconSet from './base/icon-set';

export default {
  mixins: [IconSet],
  props: {
    value: {
      type: String,
      require: true,
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
  emits: ['update:value'],
  data() {
    return {
      inputFocus: false,
    };
  },
  methods: {
    updateValue(e) {
      if (typeof e !== 'object')
        console.warn(e);
      let v = typeof e === 'object' ? e.target.value : e;
      if (v.length > 64) {
        v = v.slice(0, 64);
      }
      if (v.length === 0) {
        v = this.value[0];
      }
      this.$emit('update:value', v);
    },
    toggleInputFocus(set) {
      this.inputFocus = set;
    },
  },
}
</script>
<style lang="less" scoped>
.input-container {
  &.input-focus {
    border-color: var(--primary-light-3);
  }

  & > .input-content {
    & > input {
      padding: 0.2rem;
      border: 0;
      transition: 0.3s;
      font-size: 1rem;
      width: 100%;
    }
  }
}
</style>
