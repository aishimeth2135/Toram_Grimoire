<script lang="ts" setup generic="Item extends { id: any }">
import { computed } from 'vue'

interface Props {
  modelValue: Item | null
  options: Item[]
  currentValue: Item | null
  addable?: boolean
}
interface Emits {
  (evt: 'add-item'): void
}

const modelValue = defineModel<Item | null>({ required: true })

const props = withDefaults(defineProps<Props>(), {
  addable: false,
})
const emit = defineEmits<Emits>()

const innerOptions = computed(() => {
  return props.options.map(option => ({
    id: option.id,
    value: option,
  }))
})
</script>

<template>
  <div class="w-60">
    <cy-options
      v-model:value="modelValue"
      :options="innerOptions"
      :addable="addable"
      @add-item="emit('add-item')"
    >
      <template #item="{ value }">
        <div class="flex items-center">
          <cy-icon icon="ant-design:build-outlined" class="mr-3" />
          <slot name="item" :item="value" />
          <cy-icon
            v-if="value === currentValue"
            icon="carbon:location-current"
            class="ml-1"
          />
        </div>
      </template>
    </cy-options>
  </div>
</template>
