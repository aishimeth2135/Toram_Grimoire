<script lang="ts" setup>
const isEditing = defineModel<boolean>('isEditing', { required: true })
</script>

<template>
  <div class="flex cursor-pointer items-center" @click="isEditing = !isEditing">
    <div
      class="flex items-center rounded-l-full border-1 border-primary-10 py-1.5 pl-3 pr-2 duration-150"
      :class="{
        'border-primary-30': !isEditing,
        'border-r-0': isEditing,
        'bg-primary-10/50': isEditing,
      }"
    >
      <cy-icon icon="mdi:format-list-bulleted" width="1rem" />
    </div>
    <div
      class="flex items-center rounded-r-full border-1 border-primary-10 py-1.5 pl-2 pr-3 duration-150"
      :class="{
        'border-primary-30': isEditing,
        'border-l-0': !isEditing,
        'bg-primary-10/50': !isEditing,
      }"
    >
      <cy-icon icon="mdi:edit" width="1rem" />
    </div>
  </div>
</template>
