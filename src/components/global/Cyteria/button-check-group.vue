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

<script lang="ts" setup>
interface Props {
  value: any;
  options: {
    text: string;
    value: any;
  }[];
}

interface Emits {
  (evt: 'update:value', value: any): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const selectItem = (item: { text: string; value: any }) => {
  emit('update:value', item.value);
};
</script>
