<template>
  <span class="app--left-menu relative z-50" @click="unfold=!unfold">
    <cy-button :iconify-name="currentIconName"
      type="icon" class="top-button" />
    <transition name="fade">
      <div v-show="!unfold" @click.stop="menuClick()"
        class="menu z-1 min-h-full absolute"
        v-if="viewButtons && viewButtons.length != 0">
        <div class="conent-container w-full h-full">
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
import Vuex from 'vuex';

export default {
  data() {
    return {
      unfold: !this.screenWidthCheck()
    };
  },
  computed: {
    ...Vuex.mapState('leftMenu', ['viewButtons']),
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

.app--left-menu {
  ::v-deep(.top-button) {
    z-index: 2;
    position: relative;
    display: block;
  }

  & > .menu {
    width: 15.5rem;
    top: 3.2rem;
    left: 0.4rem;
    max-height: calc(100vh - 5rem);
    opacity: 1;

    &.fade-enter-from,
    &.fade-leave-to {
      opacity: 0;
    }

    &.fade-enter-active,
    &.fade-leave-active {
      transition: all 0.4s ease;
    }

    > .conent-container {
      padding: 0.6rem;
      padding-top: 1rem;
    }
  }
}

@media screen and (max-width: 82rem) {
  .app--left-menu {
    > .top-button {
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

      &.fade-enter-from,
      &.fade-leave-to {
        left: -20rem;
        opacity: 1;
      }

      > .conent-container {
        width: 16rem;
        background-color: var(--white);
      }
    }
  }
}
</style>