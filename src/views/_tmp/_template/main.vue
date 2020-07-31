<template>
  <article>
    <div class="main">
    </div>
    <div class="window-container">
    </div>
  </article>
</template>
<script>
import GetLang from "@global-modules/LanguageSystem.js";

import init from "./init.js";

export default {
  beforeCreate() {
    init();
  }
};
</script>
<style lang="less" scoped>
</style>