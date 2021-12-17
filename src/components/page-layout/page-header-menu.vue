<template>
  <div
    class="p-4 border-1 border-light-2 rounded-md mx-2 mb-4 z-10 bg-white duration-300"
    :class="{ sticky: visible, 'border-light-3': visible }"
    style="top: 3.75rem;"
  >
    <slot />
  </div>
</template>

<script>
export default {
  name: 'CyTopHeaderMenu',
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
};
</script>
