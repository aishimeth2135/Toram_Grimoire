<script lang="ts" setup generic="Item extends string | number">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useToggleList } from '@/shared/setup/State'

interface Props {
  modelValue: Item[]
  items: Item[]
}
interface Emits {
  (evt: 'update:model-value', value: Item[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const innerValue = computed<Item[]>({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:model-value', value)
  },
})

const { itemSelected: filterSelected, toggleItem: toggleFilterSelected } =
  useToggleList(innerValue)

const selectAllFilters = () => {
  innerValue.value = props.items.slice()
}

const allFieldFilterEnabled = computed({
  get() {
    return innerValue.value.length === props.items.length
  },
  set() {
    if (innerValue.value.length === props.items.length) {
      innerValue.value = []
    } else {
      selectAllFilters()
    }
  },
})

const { t } = useI18n()
</script>

<template>
  <cy-popover class="flex-shrink-0">
    <cy-button-circle icon="mdi:filter" small />
    <template #popper>
      <div class="p-3">
        <div class="pb-1">
          <cy-button-check v-model:selected="allFieldFilterEnabled">
            <span class="text-primary-30">
              {{ t('global.select-all') }}
            </span>
          </cy-button-check>
        </div>
        <div v-for="item in items" :key="item">
          <cy-button-check
            :selected="filterSelected(item)"
            @click="toggleFilterSelected(item)"
          >
            <slot name="item" :item="item" />
          </cy-button-check>
        </div>
      </div>
      <slot name="footer" />
    </template>
  </cy-popover>
</template>
