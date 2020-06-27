<template>
  <div class="main--show-message">
    <transition-group name="fade-slide">
      <div v-for="data in messages" :key="data.iid" class="message-item">
        <cy-icon-text :iconify-name="data.icon" class="icon" />
        <span class="text">{{ data.message }}</span>
      </div>
    </transition-group>
  </div>
</template>
<script>
  import store from "@store/show-message.js";
  import Vuex from "vuex";

  export default {
    store,
    computed: {
      ...Vuex.mapState(['messages'])
    }
  };
</script>
<style lang="less" scoped>
.main--show-message {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  max-width: calc(100vw - 2rem);
  width: 20rem;
}
.message-item {
  transition: 0.3s;
  background-color: var(--primary-dark);
  color: var(--white);
  padding: 0.8rem;
  display: flex;
  align-items: center;
  margin-top: 1rem;
  border-radius: 0.2rem;
  width: 100%;

  > .icon {
    margin-right: 0.8rem;
    --icon-color: var(--primary-light);
  }
}
.fade-slide-enter {
  opacity: 0;
  transform: translateX(-30%);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(30%);
}
</style>