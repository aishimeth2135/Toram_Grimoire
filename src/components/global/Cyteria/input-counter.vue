<template>
  <div class="cy--input-counter" :class="{ 'line': type == 'line' }">
    <div class="title" v-if="$slots['title']">
      <slot name="title"></slot>
    </div>
    <div class="counter-content">
      <cy-button class="button" type="icon-only" iconify-name="ic-round-remove-circle-outline"
        @click="setValue(value - step)" />
      <input type="number" :value="value" @input="updateValue"
        @click="selectInput($event)" />
      <cy-button class="button" type="icon-only" iconify-name="ic-round-add-circle-outline"
        @click="setValue(value + step)" />
      <slot name="unit"></slot>
    </div>
  </div>
</template>
<script>
  export default {
    props: {
      'value': {
        type: Number,
        require: true
      },
      'range': { // [min, max]
        type: Array,
        default: () => [null, null],
        validation: v => v.length != 2 || !v.every(p => typeof p == 'number' || p === null)
      },
      'step': {
        type: Number,
        default: 1
      },
      type: {
        type: String,
        default: 'normal',
        validation: v => ['normal', 'line'].includes(v)
      }
    },
    methods: {
      selectInput(e) {
        e.target.select();
      },
      setValue(v) {
        v = v || 0;

        const min = this.range[0],
          max = this.range[1];
        max !== null && (v = Math.min(max, v));
        min !== null && (v = Math.max(min, v));

        this.$emit('set-value', v);
      },
      updateValue(e) {
        this.setValue(parseInt(e.target.value, 10));
      }
    }
  };
</script>
<style lang="less" scoped>
.cy--input-counter {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 1rem;
  transition: border-color 0.3s;
  border: 1px solid var(--primary-light);
  --input-width: 2rem;

  > .title {
    display: inline-flex;
    margin-right: 0.8rem;
  }

  > .counter-content {
    display: inline-flex;
    > input {
      width: var(--input-width);
      border: 0;
      outline: 0;
      text-align: center;
      font-size: 1rem;
    }
  }

  &.line {
    display: flex;
    > .counter-content {
      margin-left: auto;
    }
  }
}
</style>