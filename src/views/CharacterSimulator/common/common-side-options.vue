<script lang="ts" setup generic="Item extends CommonItem">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Draggable from 'vuedraggable'

import { CommonItem } from '@/lib/common/Items'

interface Props {
  currentValue: Item | null
  addable?: boolean
  movable?: boolean
}
interface Emits {
  (evt: 'add-item'): void
}

const innerValue = defineModel<Item | null>({ required: true })
const options = defineModel<Item[]>('options', { required: true })

withDefaults(defineProps<Props>(), {
  addable: false,
  movable: false,
})
const emit = defineEmits<Emits>()

const { t } = useI18n()

const moveMode = ref(false)
</script>

<template>
  <div class="hidden w-72 flex-shrink-0 space-y-0.5 pr-8 wd:block">
    <div
      v-if="addable || movable"
      class="mb-3 flex justify-end border-b border-primary-10 pb-1 pt-1"
    >
      <cy-button-icon
        v-if="movable"
        icon="mdi:sort"
        :selected="moveMode"
        @click="moveMode = !moveMode"
      />
      <cy-button-icon
        icon="ic-round-add-circle-outline"
        :disabled="moveMode"
        @click="emit('add-item')"
      />
    </div>
    <template v-if="!moveMode">
      <div
        v-for="option in options"
        :key="option.id"
        class="flex w-full cursor-pointer items-center rounded-r-md px-4 py-2.5"
        :class="
          option === innerValue
            ? 'bg-primary-5/75 text-primary-80'
            : 'text-stone-60'
        "
        @click="innerValue = option"
      >
        <cy-icon
          v-if="option === innerValue"
          icon="mdi:circle-double"
          :class="{ 'opacity-0': option !== innerValue }"
          class="mr-3"
        />
        <cy-icon v-else icon="mdi:circle-outline" class="mr-3 opacity-30" />
        <slot name="item" :item="option" />
        <cy-icon
          v-if="option === currentValue"
          icon="carbon:location-current"
          class="ml-1"
        />
      </div>
    </template>
    <template v-else>
      <div class="text-right text-sm text-primary-30">
        {{ t('character-simulator.build-common.move-tips') }}
      </div>
      <Draggable v-model="options" item-key="id">
        <template #item="{ element }">
          <div class="flex cursor-move items-center px-4 py-2.5">
            <cy-icon icon="ic:baseline-drag-indicator" class="mr-2" />
            {{ element.name }}
          </div>
        </template>
      </Draggable>
    </template>
  </div>
</template>
