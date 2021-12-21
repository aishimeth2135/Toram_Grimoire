<template>
  <footer v-once class="app--footer">
    <div class="main-content">
      <cy-icon-text icon="uil-twitter-alt" class="ml-auto">
        <a href="https://twitter.com/Cyteria_w" target="_blank" class="text-purple mr-2">Cyteria</a>
      </cy-icon-text>
    </div>
  </footer>
</template>

<style lang="less" scoped>
footer.app--footer {
  border-top: 1px var(--primary-light) solid;
  margin-top: 2rem;
  background-color: var(--white);
  height: 3rem;

  > .main-content {
    max-width: 50rem;
    margin-left: auto;
    margin-right: auto;
    text-align: right;
    padding: 0.3rem 0.6rem;
    overflow-x: auto;
    white-space: nowrap;
    display: flex;
    align-items: center;
  }
}
</style>
