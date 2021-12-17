<template>
  <div class="cy--input-counter-container">
    <div
      class="cy--input-counter border bg-white duration-300 outline-none"
      :class="rootClassList"
      :style="rootStyle"
    >
      <div v-if="$slots['title']" class="title">
        <slot name="title" />
      </div>
      <div class="counter-content">
        <cy-button-icon
          v-if="minButton && range[0] !== null"
          icon="akar-icons:circle-chevron-left"
          :icon-color="mainColor"
          :icon-color-hover="mainColorInstance.darken"
          @click="setValue(range[0])"
        />
        <cy-button-icon
          icon="ic-round-remove-circle-outline"
          :icon-color="mainColor"
          :icon-color-hover="mainColorInstance.darken"
          @click="setValue(value - step)"
        />
        <input
          v-model.number.lazy="inputValue"
          type="number"
          @click="selectInput($event)"
          @focus="setInputFocus(true)"
          @blur="setInputFocus(false)"
        >
        <cy-button-icon
          icon="ic-round-add-circle-outline"
          :icon-color="mainColor"
          :icon-color-hover="mainColorInstance.darken"
          @click="setValue(value + step)"
        />
        <cy-button-icon
          v-if="maxButton && range[1] !== null"
          icon="akar-icons:circle-chevron-right"
          :icon-color="mainColor"
          :icon-color-hover="mainColorInstance.darken"
          @click="setValue(range[1])"
        />
        <span v-if="$slots['unit']" class="text-sm ml-1">
          <slot name="unit" />
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import Color from '@/shared/services/Color';

const ColorList = Color.List;

export default {
  props: {
    'value': {
      type: Number,
      require: true,
    },
    'range': { // [min, max]
      type: Array,
      default: () => [null, null],
      validation: v => v.length !== 2 || !v.every(p => typeof p === 'number' || p === null),
    },
    'step': {
      type: Number,
      default: 1,
    },
    'type': {
      type: String,
      default: 'normal',
      validation: v => ['normal', 'line'].includes(v),
    },
    'inline': {
      type: Boolean,
      default: false,
    },
    'disabled': {
      type: Boolean,
      default: false,
    },
    'maxButton': {
      type: Boolean,
      default: false,
    },
    'minButton': {
      type: Boolean,
      default: false,
    },
    'mainColor': {
      type: String,
      default: 'light-2',
      validation: v => ColorList.includes(v),
    },
    inputWidth: {
      type: String,
      default: null,
    },
  },
  emits: ['update:value'],
  data() {
    return {
      focus: false,
    };
  },
  computed: {
    rootClassList() {
      return {
        'line': this.type === 'line',
        'inline': this.inline,
        ['border-' + this.mainColor]: !this.focus,
        'disabled': this.disabled,
        ['border-' + this.mainColorInstance.darken]: !this.inline && this.focus,
        ['ring-' + this.mainColorInstance.darken]: !this.inline && this.focus,
        'ring-1': !this.inline && this.focus,
      };
    },
    rootStyle() {
      const style = {};
      if (this.inputWidth !== null) {
        style['--input-width'] = this.inputWidth;
      }
      return style;
    },
    mainColorInstance() {
      return new Color(this.mainColor);
    },
    inputValue: {
      get() {
        return this.value;
      },
      set(v) {
        v = v || 0;

        const min = this.range[0],
          max = this.range[1];
        max !== null && (v = Math.min(max, v));
        min !== null && (v = Math.max(min, v));

        this.$emit('update:value', v);
      },
    },
  },
  methods: {
    setInputFocus(v) {
      this.focus = v;
    },
    selectInput(e) {
      e.target.select();
    },
    setValue(v) {
      this.inputValue = v;
    },
  },
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
    align-items: center;
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
