<template>
  <div class="cy--input-counter-container">
    <div class="cy--input-counter border border-light bg-white" :class="conunterClassList">
      <div class="title" v-if="$slots['title']">
        <slot name="title"></slot>
      </div>
      <div class="counter-content">
        <cy-button v-if="minButton && range[0] !== null"
          type="icon" icon="akar-icons:circle-chevron-left"
          :icon-color="mainColor" :icon-color-hover="mainColorInstance.darken"
          @click="setValue(range[0])" />
        <cy-button type="icon" icon="ic-round-remove-circle-outline"
          :icon-color="mainColor" :icon-color-hover="mainColorInstance.darken"
          @click="setValue(value - step)" />
        <input type="number" :value="value" @input="updateValue"
          @click="selectInput($event)" />
        <cy-button type="icon" icon="ic-round-add-circle-outline"
          :icon-color="mainColor" :icon-color-hover="mainColorInstance.darken"
          @click="setValue(value + step)" />
        <cy-button v-if="maxButton && range[1] !== null"
          type="icon" icon="akar-icons:circle-chevron-right"
          :icon-color="mainColor" :icon-color-hover="mainColorInstance.darken"
          @click="setValue(range[1])" />
        <slot name="unit"></slot>
      </div>
    </div>
  </div>
</template>
<script>
import Color from "@services/Color";

const ColorList = Color.List;

export default {
  emits: ['update:value'],
  props: {
    'value': {
      type: Number,
      require: true
    },
    'range': { // [min, max]
      type: Array,
      default: () => [null, null],
      validation: v => v.length != 2 || !v.every(p => typeof p === 'number' || p === null)
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
    },
    'disabled': {
      type: Boolean,
      default: false
    },
    'maxButton': {
      type: Boolean,
      default: false
    },
    'minButton': {
      type: Boolean,
      default: false
    },
    'mainColor': {
      type: String,
      default: 'light-2',
      validation: v => ColorList.includes(v)
    }
  },
  computed: {
    conunterClassList() {
      return {
        'line': this.type === 'line',
        'inline': this.inline,
        ['border-' + this.mainColor]: true,
        'disabled': this.disabled
      };
    },
    mainColorInstance() {
      return new Color(this.mainColor);
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

      this.$emit('update:value', v);
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
  position: relative;

  &.inline {
    border: 0;
    padding: 0 0.5rem;
    background-color: transparent;
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

  &.disabled {
    opacity: 0.7;

    &::before {
      content: '';
      width: 100%;
      height: 100%;
      cursor: not-allowed;
      z-index: 10;
      display: inline-block;
      position: absolute;
      left: 0;
      top: 0;
    }
  }
}
</style>