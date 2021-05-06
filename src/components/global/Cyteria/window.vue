<template>
  <cy-transition type="fade">
    <div class="window" v-if="visible" @click="closeWindow"
      :class="rootClass">
      <div class="content-container">
        <div class="top-mask" />
        <cy-button type="icon" @click.stop="closeWindow"
          icon="jam-close-circle-f" class="close-btn" />
        <div class="container-inner" @click.stop>
          <div class="top">
            <slot name="title"></slot>
          </div>
          <div class="content">
            <slot></slot>
          </div>
          <div class="tail" v-if="type === 'confirm'">
            <cy-button @click="confirmCallback"
              icon="ic-round-check">
              {{ $globalLang('global/confirm') }}
            </cy-button>
            <cy-button @click="closeWindow"
              icon="ic-round-close">
              {{ $globalLang('global/cancel') }}
            </cy-button>
          </div>
        </div>
      </div>
    </div>
  </cy-transition>
</template>
<script>
export default {
  emits: ['update:visible', 'close'],
  props: {
    type: {
      type: String,
      default: 'normal'
    },
    visible: {
      required: true
    },
    confirmCallback: {
      type: Function
    },
    verticalPosition: {
      type: String,
      default: 'center'
    },
    width: {
      type: String,
      default: 'normal',
      validation: v => ['normal', 'auto', 'wide'].includes(v)
    },
    forzenTop: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    rootClass() {
      return {
        ['vertical-position-' + this.verticalPosition]: true,
        ['width-' + this.width]: true,
        'frozen-top': this.forzenTop
      };
    }
  },
  methods: {
    closeWindow() {
      this.$emit('update:visible', false);
      this.$emit('close');
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
  z-index: 50;
  background-color: rgba(var(--rgb-black), 0.1);

  & > .content-container {
    position: relative;
    display: inline-block;
    margin: 1rem 0.5rem;
    height: calc(100% - 2rem);

    @media screen and (max-width: 26rem) {
      width: calc(100% - 1rem)!important;
    }

    & > .top-mask {
      position: absolute;
      background-color: var(--white);
      height: 0.9rem;
      width: calc(100% - 2rem);
      top: 0.1rem;
      left: 1rem;
      z-index: 1;
    }

    .close-btn {
      position: absolute;
      top: -0.75rem;
      right: -0.8rem;
      z-index: 51;
      --icon-width: 1.5rem;
      padding: 0;

      &::before {
        content: '';
        position: absolute;
        top: 0.3rem;
        left: 0.3rem;
        width: 0.8rem;
        height: 0.8rem;
        background-color: rgba(var(--rgb-white), 0.6);
      }
    }

    > .container-inner {
      width: 100%;
      min-height: 10rem;
      overflow-y: auto;
      max-height: 100%;
      padding-top: 0.75rem;
      border: 0.1rem solid var(--primary-light);
      background-color: var(--white);

      > .top {
        padding: 0.6rem 1rem;
        padding-top: 0;
      }

      > .content {
        padding: 1rem;
        padding-top: 0;
      }
    }
  }

  &.frozen-top {
    > .content-container {
      > .container-inner {
        >.top {
          background-color: var(--white);
          position: sticky;
          top: 0;
          left: 0;
          z-index: 5;
        }
      }
    }
  }

  &.width-normal {
    > .content-container {
      width: 25rem;
    }
  }

  &.width-auto {
    > .content-container {
      width: auto;
      max-width: calc(100% - 1rem);

      > .container-inner {
        overflow: auto;
      }
    }
  }

  &.width-wide {
    > .content-container {
      width: 42.5rem;
    }
  }

  &.vertical-position-top {
    align-items: flex-start;
  }
  &.vertical-position-center {
    align-items: center;
  }
}
</style>