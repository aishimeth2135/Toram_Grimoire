<script lang="ts" setup>
interface Props {
  leftIcon: string
  rightIcon: string
}

defineProps<Props>()

const isLeft = defineModel<boolean>('isLeft', { required: true })
</script>

<template>
  <div class="flex cursor-pointer items-center" @click="isLeft = !isLeft">
    <div
      class="flex items-center rounded-l-full border-1 border-primary-10 py-1.5 pl-3 pr-2 duration-150"
      :class="{
        'border-primary-30': isLeft,
        'border-r-0': !isLeft,
        'bg-primary-10/50': !isLeft,
      }"
    >
      <cy-icon :icon="leftIcon" width="1rem" />
    </div>
    <div
      class="flex items-center rounded-r-full border-1 border-primary-10 py-1.5 pl-2 pr-3 duration-150"
      :class="{
        'border-primary-30': !isLeft,
        'border-l-0': isLeft,
        'bg-primary-10/50': isLeft,
      }"
    >
      <cy-icon :icon="rightIcon" width="1rem" />
    </div>
  </div>
</template>
