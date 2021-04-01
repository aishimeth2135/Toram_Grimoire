<template>
  <div>
    <transition mode="out-in"
      @before-leave="beforeLeave"
      @leave="leave"
      :css="false">
      <svg-icon v-if="status > 1" icon-id="potum" class="custom-icon" key="1" />
      <svg-icon v-else icon-id="potum" class="custom-icon start-icon" key="2" />
    </transition>
    <transition appear
      @enter="enter"
      :css="false">
      <div v-if="status > 1 && end" class="ball"></div>
    </transition>
  </div>
</template>

<script>
import Velocity from "velocity-animate";

export default {
  props: ['status'],
  data() {
    return {
      end: false
    }
  },
  methods: {
    beforeLeave(el) {
      el.classList.remove('start-icon');
    },
    leave(el, done) {
      Velocity(el, {
        rotateY: '0deg'
      }, {
        duration: 100
      });
      Velocity(el, {
        rotateY: '+=360deg'
      }, {
        duration: 700, easing: [0.42, 0, 1.0, 1.0],
        complete: () => {
          this.end = true;
          done();
        }
      });
    },
    beforeEnter() {
    },
    enter(el, done) {
      const pwhite = getComputedStyle(document.body).getPropertyValue('--white').trim();
      const opts = window.innerHeight > window.innerWidth ? {
        width: '120vh',
        height: '120vh',
        left: '-=60vh',
        top: '-=60vh'
      } : {
        width: '120vw',
        height: '120vw',
        left: '-=60vw',
        top: '-=60vw'
      };
      Velocity(el, {
        backgroundColor: pwhite,
        ...opts
      }, {
        duration: 600,
        complete: () => {
          done();
          setTimeout(() => this.$emit('done'), 100);
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.custom-icon {
  width: 6rem;
  height: 6rem;
  color: #f7a8d3;

  &.start-icon {
    animation: loading-page-main-icon ease 4s infinite;
  }
}

.ball {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background-color: var(--primary-light-3);
  border: 0.2rem solid var(--primary-light-3);
  position: fixed;
  transform-origin: center;
  left: calc(50% - 2.6rem);
  top: calc(50% - 2.6rem);
  z-index: 100;
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
</style>