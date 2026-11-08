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
      class="border-primary-10 flex items-center rounded-l-md border-2 px-2 py-1.5 duration-150"
      :class="{
        'border-primary-30': isLeft,
        'border-r-0': !isLeft,
        'bg-primary-10/50': !isLeft,
      }"
    >
      <cy-icon :icon="leftIcon" width="1rem" />
    </div>
    <div
      class="border-primary-10 flex items-center rounded-r-md border-2 px-2.5 py-1.5 duration-150"
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
