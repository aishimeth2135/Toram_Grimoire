<template>
  <span class="flex items-center flex-wrap my-2 mx-1">
    <div class="input-container flex items-center py-1 px-3 border-1 border-solid border-light rounded-3xl w-full duration-300"
      :class="{ 'input-focus': inputFocus }">
      <cy-icon-text :iconify-name="iconifyName" :icon-id="iconId" class="mr-2" />
      <div class="input-content w-full" ref="input-content">
        <slot></slot>
        <input v-if="!$slots.default"
          type="text" :value="value"
          :placeholder="placeholder"
          @focus="toggleInputFocus(true)"
          @blur="toggleInputFocus(false)"
          @input="updateValue">
      </div>
    </div>
  </span>
</template>
<script>
export default {
  emits: ['update:value'],
  props: {
    value: {
      type: String,
      require: true
    },
    iconifyName: {
      type: String,
      default: null
    },
    iconId: {
      type: String,
      default: null
    },
    placeholder: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      inputFocus: false
    };
  },
  methods: {
    updateValue(e) {
      if (typeof e !== 'object')
        console.warn(e);
      const v = typeof e === 'object' ? e.target.value : e;
      this.$emit('update:value', v);
    },
    toggleInputFocus(set) {
      this.inputFocus = set;
    }
  }
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