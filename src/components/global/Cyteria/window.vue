<template>
  <cy-transition type="fade">
    <div class="window" v-if="visible" @click="closeWindow"
      :class="{ ['vertical-position-' + verticalPosition]: true }">
      <div class="container">
        <div class="top-mask" />
        <cy-button type="icon-only" @click.stop="$emit('close-window')"
          iconify-name="jam-close-circle-f"
          class="close-btn" />
        <div class="container-inner" @click.stop>
          <div class="top">
            <div class="title">
              <slot name="title"></slot>
            </div>
            <span class="buttons">
              <slot name="top-buttons"></slot>
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
    </div>
  </cy-transition>
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
    },
    verticalPosition: {
      type: String,
      default: 'center'
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
  z-index: 50;
  background-color: rgba(var(--rgb-black), 0.1);

  >.container {
    width: 25rem;
    position: relative;
    display: inline-block;
    margin: 1rem 0.5rem;
    height: calc(100% - 2rem);

    > .top-mask {
      position: absolute;
      background-color: var(--white);
      height: 0.9rem;
      width: calc(100% - 2rem);
      top: 0.1rem;
      left: 1rem;
      z-index: 1;
    }

    > .close-btn {
      position: absolute;
      top: -0.75rem;
      right: -0.8rem;
      z-index: 2;
      --icon-width: 1.5rem;
      padding: 0;
    }

    > .container-inner {
      width: 100%;
      min-height: 10rem;
      overflow-y: auto;
      max-height: 100%;
      padding-top: 0.75rem;
      border: 0.1rem solid var(--primary-light);
      background-color: var(--white);

      >.top {
        padding: 0.6rem 1rem;
        padding-top: 0;
        display: flex;
        align-items: center;

        >.buttons {
          margin-left: auto;
          display: inline-flex;
          align-items: center;

          >.button {
            margin-right: 0.3rem;
          }
        }

        >.title {
          margin: 0.2rem;
          color: var(--primary-purple);
        }
      }

      >.content {
        padding: 1rem;
        padding-top: 0;
      }
    }
  }

  &.frozen-top {
    >.container {
      >.top {
        background-color: var(--white);
        position: sticky;
        top: 0;
        left: 0;
        z-index: 5;
      }
    }
  }

  &.width-auto {
    >.container {
      width: auto;
      max-width: calc(100% - 1rem);
      overflow: auto;
    }
  }

  &.width-wide {
    >.container {
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

@media screen and (max-width: 26rem) {
  .window > .container {
    width: calc(100% - 1rem)!important;
  }
}
</style>