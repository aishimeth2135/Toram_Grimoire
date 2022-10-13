<template>
  <section
    style="height: calc(100vh - 15rem)"
    class="flex w-full items-center justify-center"
  >
    <div class="relative text-center">
      <cy-icon-text
        icon="potum"
        icon-width="8rem"
        class="mb-7"
        icon-src="custom"
      />
      <cy-icon-text
        icon="bx-bx-message-rounded-x"
        icon-width="4rem"
        class="absolute -top-12 right-8"
      />
      <div class="text-3xl">404 Not Found</div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'AppPage404',
}
</script>
