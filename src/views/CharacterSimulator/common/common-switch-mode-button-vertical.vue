<script lang="ts" setup>
interface Props {
  topIcon: string
  bottomIcon: string
}

defineProps<Props>()

const isTop = defineModel<boolean>('isTop', { required: true })
</script>

<template>
  <div class="flex cursor-pointer flex-col items-center" @click="isTop = !isTop">
    <div
      class="border-primary-10 pt-1.75 flex items-center rounded-t-full border-2 px-1.5 pb-1 duration-150"
      :class="{
        'border-primary-30': isTop,
        'border-b-0': !isTop,
        'bg-primary-10/50': !isTop,
      }"
    >
      <cy-icon :icon="topIcon" width="1rem" />
    </div>
    <div
      class="border-primary-10 pb-1.75 flex items-center rounded-b-full border-2 px-1.5 pt-1 duration-150"
      :class="{
        'border-primary-30': !isTop,
        'border-t-0': isTop,
        'bg-primary-10/50': isTop,
      }"
    >
      <cy-icon :icon="bottomIcon" width="1rem" />
    </div>
  </div>
</template>
