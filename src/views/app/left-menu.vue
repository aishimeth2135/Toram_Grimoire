<template>
  <span class="app--left-menu" @click="unfold=!unfold">
    <cy-button :iconify-name="currentIconName" type="icon-only" class="top-button" />
    <transition name="fade">
      <div class="menu" v-show="!unfold" @click.stop="menuClick()"
        v-if="viewButtons && viewButtons.length != 0">
        <div class="container">
          <cy-button v-for="(data) in viewButtons" :iconify-name="data.icon"
            :key="data.title" type="line" @click="setCurrentView(data)">
            {{ data.title }}
          </cy-button>
        </div>
      </div>
    </transition>
  </span>
</template>
<script>
import store from "@store/left-menu.js";
import Vuex from 'vuex';

export default {
  store,
  data() {
    return {
      unfold: !this.screenWidthCheck()
    };
  },
  computed: {
    ...Vuex.mapState(['viewButtons']),
    currentIconName() {
      return 'ic:round-menu';
    }
  },
  methods: {
    setCurrentView(data) {
      if (this.$router.currentRoute.path != data.path)
        this.$router.replace(data.path);
    },
    menuClick() {
      this.unfold = !this.screenWidthCheck();
    },
    screenWidthCheck() {
      return document.body.clientWidth >= (50 + 16 + 16) * 16;
    }
  }
};
</script>
<style lang="less" scoped>
@deep: ~'>>>';

.app--left-menu {
  z-index: 12;
  position: relative;

  @{deep} .top-button {
    z-index: 2;
    position: relative;
    display: block;
  }

  > .menu {
    z-index: 1;
    min-height: 100%;
    position: absolute;
    width: 15.5rem;
    top: 3.2rem;
    left: 0.4rem;
    max-height: calc(100vh - 5rem);
    opacity: 1;
    

    &.fade-enter,
    &.fade-leave-to {
      opacity: 0;
    }

    &.fade-enter-active,
    &.fade-leave-active {
      transition: all 0.4s ease;
    }

    >.container {
      padding: 0.6rem;
      padding-top: 1rem;
      width: 100%;
      height: 100%;
      // border: 1px solid var(--primary-light-2);

      @{deep} .title-line {
        // border-top: 1px solid var(--primary-light-2);
        padding-bottom: 0.4rem;
        padding-top: 1rem;
        padding-left: 0.4rem;
        font-size: 0.9rem;
        color: var(--primary-light-3);
      }
    }
  }
}

@media screen and (max-width: 82rem) {
  .app--left-menu {
    >.top-button {
      z-index: 0;
    }

    >.menu {
      position: fixed;
      top: 0;
      left: 0;
      right: auto;
      height: 100%;
      width: calc(100% + 30rem);
      background-color: rgba(var(--rgb-black), 0.5);

      &.fade-enter,
      &.fade-leave-to {
        left: -20rem;
        opacity: 1;
      }

      >.container {
        width: 16rem;
        background-color: var(--white);
      }
    }
  }
}
</style>