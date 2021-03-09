<template>
  <div class="app--loading" v-show="status != 2">
    <template v-if="status < 2">
      <div class="container">
        <div class="main">
          <svg-icon icon-id="potum" />
        </div>
        <div class="msg">
          <div v-for="(item) in initItems" class="column" :key="item.msg">
            <span class="text">{{ item.msg }}</span>
            <cy-icon-text class="status-icon" :iconify-name="statusIcon(item.status)"
              :class="{'loading': item.status == 0, 'error': item.status == -1}" />
          </div>
        </div>
      </div>
      <div class="bottom-tips">
        <lang-text lang-id="Loading Page/bottom tips" />
      </div>
    </template>
  </div>
</template>

<script>
  import store from "@store/loading.js";
  import Vuex from 'vuex';

  export default {
    store,
    methods: {
      statusIcon(v) {
        if (v >= 0)
          return ['mdi-loading', 'ic-round-check-circle-outline'][v];
        return 'ic-round-close';
      }
    },
    computed: {
      ...Vuex.mapState(['initItems', 'status', 'msgItems'])
    }
  };
</script>

<style lang="less" scoped>
  @deep-operator: ~'>>>';

  .app--loading {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background-color: var(--white);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;

    > .bottom-tips {
      position: absolute;
      right: 1rem;
      bottom: 1rem;
      font-size: 0.9rem;
    }

    > .container {
      width: 30rem;
      max-width: 100%;
      text-align: center;
      > .main {
        border-bottom: 1px var(--primary-light) solid;
        padding-bottom: 1rem;

        @{deep-operator} svg {
          width: 6rem;
          height: 6rem;
          color: #f7a8d3;
          animation: loading-page-main-icon ease 4s infinite;
        }
      }
      > .msg {
        padding-top: 2rem;
        display: inline-block;

        > .column {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 0.5rem;
          padding-left: 2rem;

          > .text {
            margin-right: 0.8rem;
            width: 100%;
            color: var(--primary-light-4);
          }
          > .status-icon {
            display: flex;
          }
          > .status-icon {
            --icon-color: var(--primary-water-blue);

            &.loading {
              animation: loading-circle 0.8s ease infinite;
            }
            &.error {
              --icon-color: var(--red);
            }
          }
        }
      }
    }
  }

  @keyframes loading-page-main-icon {
    0% {
      transform: translate(0, 0);
    }
    25% {
      transform: translate(0, -25%);
    }
    50% {
      transform: translate(0, 0);
    }
    75% {
      transform: translate(0, -15%);
    }
    100% {
      transform: translate(0, 0);
    }
  }

  @keyframes loading-circle {
    0% {
      transform: rotateZ(0);
    }
    80% {
      transform: rotateZ(359deg);
    }
    100% {
      transform: rotateZ(360deg);
    }
  }
</style>