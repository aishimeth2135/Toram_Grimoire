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
  props: {
    value: {},
    options: {
      type: Array,
      required: true,
    },
  },
  emits: ['update:value'],
  methods: {
    selectItem(item) {
      this.$emit('update:value', item.value);
    },
  },
}
</script>
