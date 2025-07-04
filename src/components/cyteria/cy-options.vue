<template>
  <CyPopover class="cy--options" :placement="placement">
    <template #default="{ shown }">
      <slot name="title" :shown="shown">
        <div
          class="cy--options-item cy--options-title flex items-center border border-primary-30 bg-white duration-200 hover:border-primary-50"
        >
          <slot v-if="value !== undefined && value !== null" name="item" :value="value" />
          <div v-else class="flex w-full justify-center py-0.5">
            <cy-icon icon="ic:outline-help-outline" />
          </div>
        </div>
      </slot>
    </template>
    <template #popper="{ hide }">
      <div class="cy--options-items-wrapper">
        <slot name="options">
          <div class="py-0.5">
            <div
              v-for="item in options"
              :key="item.id"
              class="cy--options-item"
              :class="{ 'cy--options-item-selected': item.value === value }"
              @click="(emit('update:value', item.value), hide())"
            >
              <slot :id="item.id" name="item" :value="item.value" />
            </div>
          </div>
          <div
            v-if="addable"
            class="cy--options-item sticky bottom-0 justify-center border-t border-primary-30 bg-white"
            @click="(emit('add-item'), hide())"
          >
            <div class="flex py-0.5">
              <cy-icon icon="ic-round-add-circle-outline" />
            </div>
          </div>
        </slot>
      </div>
    </template>
  </CyPopover>
</template>

<script lang="ts" setup>
import CyPopover from './cy-popover/cy-popover.vue'

interface OptionItem {
  id: string | number
  value: any
}

interface Props {
  value: any
  options?: OptionItem[]
  addable?: boolean
  placement?: string
}
interface Emits {
  (evt: 'update:value', value: any): void
  (evt: 'add-item'): void
}

withDefaults(defineProps<Props>(), {
  options: () => [] as OptionItem[],
  addable: false,
  placement: 'bottom-end',
})
const emit = defineEmits<Emits>()
</script>

<style>
@reference "@/tailwind.css";

.cy--options-title,
.cy--options-items-wrapper {
  max-width: 20rem;
  width: 100%;
}

.cy--options-items-wrapper {
  max-height: 40vh;
  overflow-y: auto;
}

.cy--options-item {
  @apply flex cursor-pointer px-2 py-1.5 duration-200;

  &:hover,
  &.cy--options-item-selected {
    @apply bg-primary-5;
  }
}
</style>
