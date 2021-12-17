<template>
  <section class="flex flex-col">
    <slot name="header" />
    <div>
      <slot />
    </div>
    <slot name="footer" />
  </section>
</template>
