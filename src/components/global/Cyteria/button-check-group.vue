<template>
  <div>
    <cy-button-check
      v-for="item in options"
      :key="item.text"
      :selected="value === item.value"
      @click="selectItem(item)"
    >
      {{ item.text }}
    </cy-button-check>
  </div>
</template>

<script>
export default {
  emits: ['update:value'],
  props: {
    value: {},
    options: {
      type: Array,
      required: true,
    },
  },
  methods: {
    selectItem(item) {
      this.$emit('update:value', item.value);
    },
  },
}
</script>