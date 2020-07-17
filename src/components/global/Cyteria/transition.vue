<template>
  <transition v-if="isNormalType" :name="type" :mode="mode">
    <slot></slot>
  </transition>
  <transition v-else
    :css="false"
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="afterEnter"

    @before-leave="beforeLeave"
    @leave="leave"
    @after-leave="afterLeave">
    <slot></slot>
  </transition>
</template>
<script>
  import Velocity from "velocity-animate";

  export default {
    props: {
      type: {
        type: String
      },
      mode: {
        type: String,
        default: ''
      }
    },
    computed: {
      isNormalType() {
        return this.type == 'fade';
      }
    },
    methods: {
      getBox(el) {
        el = el.cloneNode(true);

        el.style.position = 'absolute';
        el.style.visibility = 'hidden';
        el.style.display = 'block';

        document.body.append(el);
        const box = el.getBoundingClientRect();
        el.remove();

        return box;
      },
      handleHook(hook, el, done) {
        if (this.type == 'slide-up') {
          const h = this.getBox(el).height;
          const mb = (-1 * Math.floor(h)) + 'px';
          const ops = {
            easing: 'ease',
            duration: 400,
            complete: done
          };

          if (hook == 'enter') {
            Velocity(el, { marginBottom: ['', mb] }, ops);
          } else if (hook == 'leave') {
            Velocity(el, { marginBottom: mb }, ops);
          }
        }
      },
      beforeEnter(el) {
        this.handleHook('beforeEnter', el);
      },
      enter(el, done) {
        this.handleHook('enter', el, done);
      },
      afterEnter(el) {
        this.handleHook('afterEnter', el);
      },
      beforeLeave(el) {
        this.handleHook('beforeLeave', el);
      },
      leave(el, done) {
        this.handleHook('leave', el, done);
      },
      afterLeave(el) {
        this.handleHook('afterLeave', el);
      }
    }
  }
</script>
<style lang="less" scoped>
.fade-enter, .fade-leave-to {
  opacity: 0;
}
.fade-enter-active, .fade-leave-active {
  transition: 0.3s;
}
.fade-enter-to, .fade-leave {
  opacity: 1;
}

.slide-up-enter, .slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
.slide-up-enter-active, .slide-up-leave-active {
  transition: 0.4s ease;
}
</style>