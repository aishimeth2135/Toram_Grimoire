<template>
  <transition name="fade">
    <div class="window" v-if="visible" @click="closeWindow">
      <div class="container" @click.stop>
        <div class="top">
          <div class="title">
            <slot name="title"></slot>
          </div>
          <span class="buttons">
            <slot name="top-buttons"></slot>
            <cy-button v-if="type == 'normal'" type="icon-only" @click="$emit('close-window')" iconify-name="ic:round-close">
            </cy-button>
          </span>
        </div>
        <div class="content">
          <slot></slot>
        </div>
        <div class="tail" v-if="type == 'confirm'">
          <cy-button @click="confirmCallback" iconify-name="ic-round-check" text-lang-id="global/confirm">
          </cy-button>
          <cy-button @click="closeWindow" iconify-name="ic-round-close" text-lang-id="global/confirm">
          </cy-button>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
export default {
  props: {
    'type': {
      type: String,
      default: 'normal'
    },
    'titleLangId': {
      default: null
    },
    'visible': {
      required: true
    },
    'iconifyName': {
      type: String,
      default: 'mdi:checkbox-multiple-blank-circle-outline'
    },
    confirmCallback: {
      type: Function
    }
  },
  methods: {
    closeWindow() {
      this.$emit('close-window');
    }
  }
};
</script>
<style lang="less" scoped>
.window {
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  background-color: rgba(var(--rgb-black), 0.1);

  &.fade-enter {
    opacity: 0;
  }

  &.fade-enter-active,
  &.fade-leave-active {
    transition: 0.3s ease;
  }

  &.fade-leave-to {
    opacity: 0;
  }

  &>.container {
    width: 25rem;
    margin: 1rem 0.5rem;
    border: 1px solid var(--primary-light);
    background-color: var(--white);
    overflow-y: auto;
    max-height: calc(100% - 1rem);
    min-height: 10rem;

    &>.top {
      padding: 0.6rem 1rem;
      display: flex;
      align-items: center;

      &>.buttons {
        margin-left: auto;
        display: inline-flex;
        align-items: center;

        &>.button {
          margin-right: 0.3rem;
        }
      }

      &>.title {
        margin: 0.2rem;
        color: var(--primary-purple);
      }
    }

    &>.content {
      padding: 1rem;
      padding-top: 0;
    }

    &::-webkit-scrollbar {
      width: 0.5rem;
      height: 0.5rem;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--primary-light-2);
      border-radius: 0.22rem;
      transition: 0.3s;
    }

    &::-webkit-scrollbar-corner {
      background-color: var(--white);
    }
  }

  &.frozen-top {
    &>.container {
      &>.top {
        background-color: var(--white);
        position: sticky;
        top: 0;
        left: 0;
        z-index: 5;
      }
    }
  }

  &.width-auto {
    &>.container {
      width: auto;
      max-width: 100% - 1rem;
      overflow: auto;
    }
  }

  &.width-wide {
    &>.container {
      width: 42.5rem;
    }
  }
}

@media screen and (max-width: 26rem) {
  .window>.container {
    width: 100%;

    &::-webkit-scrollbar {
      width: 0.2rem;
      height: 0.2rem;
      border-radius: 0.1rem;
    }
  }
}
</style>