<template>
  <transition
    v-bind="$attrs"
    :css="false"
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="afterEnter"

    @before-leave="beforeLeave"
    @leave="leave"
    @after-leave="afterLeave"
  >
    <slot />
  </transition>
</template>

<script>
import Velocity from 'velocity-animate'

export default {
  name: 'CyTransitionSlide',
  methods: {
    getBox(el) {
      el = el.cloneNode(true)

      el.style.position = 'absolute'
      el.style.visibility = 'hidden'
      el.style.display = 'block'

      document.body.append(el)
      const box = el.getBoundingClientRect()
      el.remove()

      return box
    },
    handleHook(hook, el, done) {
      if (this.type === 'slide-up') {
        const height = this.getBox(el).height
        const mb = (-1 * Math.floor(height)) + 'px'
        const ops = {
          easing: 'ease',
          duration: 400,
          complete: done,
        }

        if (hook === 'enter') {
          Velocity(el, { marginBottom: ['', mb] }, ops)
        } else if (hook === 'leave') {
          Velocity(el, { marginBottom: mb }, ops)
        }
      }
    },
    beforeEnter(el) {
      this.handleHook('beforeEnter', el)
    },
    enter(el, done) {
      this.handleHook('enter', el, done)
    },
    afterEnter(el) {
      this.handleHook('afterEnter', el)
    },
    beforeLeave(el) {
      this.handleHook('beforeLeave', el)
    },
    leave(el, done) {
      this.handleHook('leave', el, done)
    },
    afterLeave(el) {
      this.handleHook('afterLeave', el)
    },
  },
}
</script>

<style lang="postcss" scoped>
.fade-slide-right-enter-from {
  transform: translateX(-20%);
  opacity: 0;
}
.fade-slide-right-enter-to {
  transform: 0;
  opacity: 1;
}
.fade-slide-right-leave-to {
  transform: translateX(20%);
  opacity: 0;
}
.fade-slide-right-enter-active, .fade-slide-right-leave-active {
  transition: 0.3s ease;
}

.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
.slide-up-enter-active, .slide-up-leave-active {
  transition: 0.4s ease;
}
</style>
