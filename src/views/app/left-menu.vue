<template>
  <span class="app--left-menu relative z-50" @click="unfold=!unfold">
    <cy-button-icon :icon="currentIconName" class="top-button" />
    <transition name="fade">
      <div
        v-if="viewButtons && viewButtons.length != 0"
        v-show="!unfold"
        class="menu z-1 min-h-full absolute"
        @click.stop="menuClick()"
      >
        <div class="conent-container w-full h-full">
          <cy-button-line
            v-for="(data) in viewButtons"
            :icon="data.icon"
            :key="data.title"
            @click="setCurrentView(data)"
          >
            {{ data.title }}
          </cy-button-line>
        </div>
      </div>
    </transition>
  </span>
</template>
<script>
import { mapState } from 'vuex';

export default {
  data() {
    return {
      unfold: !this.screenWidthCheck()
    };
  },
  computed: {
    ...mapState('left-menu', ['viewButtons']),
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