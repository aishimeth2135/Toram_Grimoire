<template>
  <div class="inline-block">
    <transition
      mode="out-in"
      :css="false"
      @before-leave="beforeLeave"
      @leave="leave"
    >
      <svg-icon v-if="status > 1" key="1" icon-id="potum" class="custom-icon" />
      <svg-icon v-else key="2" icon-id="potum" class="custom-icon start-icon" />
    </transition>
    <transition
      appear
      :css="false"
      @enter="enter"
    >
      <div v-if="status > 1 && end" class="ball" />
    </transition>
  </div>
</template>

<script>
import Velocity from 'velocity-animate';

export default {
  props: ['status'],
  emits: ['done'],
  data() {
    return {
      end: false,
    };
  },
  methods: {
    beforeLeave(el) {
      el.classList.remove('start-icon');
    },
    leave(el, done) {
      Velocity(el, {
        rotateY: '0deg',
      }, {
        duration: 100,
      });
      Velocity(el, {
        rotateY: '+=360deg',
      }, {
        duration: 700, easing: [0.42, 0, 1.0, 1.0],
        complete: () => {
          this.end = true;
          done();
        },
      });
    },
    beforeEnter() {
    },
    enter(el, done) {
      const pwhite = getComputedStyle(document.body).getPropertyValue('--white').trim();
      const opts = window.innerHeight > window.innerWidth ? {
        width: '150vh',
        height: '150vh',
        left: '-=75vh',
        top: '-=75vh',
      } : {
        width: '150vw',
        height: '150vw',
        left: '-=75vw',
        top: '-=75vw',
      };
      Velocity(el, {
        backgroundColor: pwhite,
        ...opts,
      }, {
        duration: 600,
        complete: () => {
          done();
          setTimeout(() => this.$emit('done'), 100);
        },
      });
    },
  },
};
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
