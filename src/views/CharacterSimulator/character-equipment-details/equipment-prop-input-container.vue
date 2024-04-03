<template>
  <div class="flex items-stretch">
    <slot />
    <div class="flex flex-col">
      <div class="mt-auto border-b border-transparent">
        <slot name="append" />
      </div>
    </div>
    <div class="ml-2 self-start">
      <slot name="end" />
    </div>
  </div>
</template>
