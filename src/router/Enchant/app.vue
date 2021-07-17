<template>
  <article>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </article>
</template>
<script>
export default {};
</script>
<style lang="less" scoped>
</style>
