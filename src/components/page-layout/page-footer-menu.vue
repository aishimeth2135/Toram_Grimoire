<template>
  <div class="sticky bottom-3 px-2 z-10">
    <div class="w-full">
      <slot name="content-before"></slot>
      <div class="border-1 border-light-2 py-2 pl-4 pr-6 mx-3 mt-3 rounded-full flex items-center flex-wrap bg-white">
        <slot name="content"></slot>
      </div>
    </div>
  </div>
</template>
