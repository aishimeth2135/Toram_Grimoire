<template>
  <div class="main--show-message">
    <transition-group name="fade-slide">
      <div v-for="msg in messages" :key="msg.iid" class="message-item">
        <div class="container">
          <cy-icon-text :iconify-name="msg.icon" class="icon" />
          <span class="text">{{ msg.message }}</span>
        </div>
        <div v-if="msg.options.buttons && msg.options.buttons.length != 0">
          <span v-for="btn in msg.options.buttons" :key="btn.iid"
            class="msg-btn" @click="messageButtonClick(msg, btn)">
            {{ btn.text || '|' + btn.iid + '|' }}
          </span>
        </div>
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
    },
    methods: {
      messageButtonClick(msg, btn) {
        if (btn.click)
          btn.click();
        if (btn.removeMessageAfterClick)
          this.$store.commit('removeMessage', msg);
      }
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
  z-index: 51;
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
  flex-wrap: wrap;

  > .container {
    display: inline-flex;
    align-items: center;

    > .icon {
      margin-right: 0.8rem;
      --icon-color: var(--primary-light);
    }
  }
}

.msg-btn {
  cursor: pointer;
  margin-left: 0.7rem;
  color: var(--primary-light-2);
  text-align: right;

  &:hover {
    color: var(--primary-light);
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