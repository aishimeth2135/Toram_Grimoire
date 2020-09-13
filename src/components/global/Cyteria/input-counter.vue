<template>
  <div class="cy--input-counter-container">
    <div class="cy--input-counter" :class="{ 'line': type == 'line', 'inline': inline }">
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
      'type': {
        type: String,
        default: 'normal',
        validation: v => ['normal', 'line'].includes(v)
      },
      'inline': {
        type: Boolean,
        default: false
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
.cy--input-counter-container {
  display: block;
  --input-width: 2.1rem;
}
.cy--input-counter {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 1rem;
  transition: border-color 0.3s;
  border: 1px solid var(--primary-light);

  &.inline {
    border: 0;
    padding-top: 0;
    padding-bottom: 0;
  }

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