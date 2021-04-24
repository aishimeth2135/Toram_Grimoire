<template>
  <section class="main--">
    <div class="conent-container">
      <cy-icon-text icon="potum" class="icon" icon-src="custom" />
      <cy-icon-text icon="bx-bx-message-rounded-x" class="fix-icon" />
      <div class="text">404 Not Found</div>
    </div>
  </section>
</template>
<script>
  export default {};
</script>
<style lang="less" scoped>
.main-- {
  width: 100%;
  height: calc(100vh - 15rem);
  display: flex;
  align-items: center;
  justify-content: center;

  > .conent-container {
    text-align: center;
    position: relative;

    > .icon {
      --icon-width: 8rem;
      margin-bottom: 1.8rem;
    }
    > .text {
      font-size: 2rem;
    }

    > .fix-icon {
      --icon-width: 4rem;
      position: absolute;
      top: -3rem;
      right: 2rem;
    }
  }
}
</style>