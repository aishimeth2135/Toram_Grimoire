<template>
  <div :class="classes.root">
    <HomeIconTitle :class="classes.wrapper" :root-el="rootEl" />
    <div :class="classes.title">
      <div :class="classes.sub" class="text-4xl text-primary-70">
        Cy's Grimoire
      </div>
      <div class="mt-2 text-xl text-primary-40" :class="classes.sub">
        布偶的魔法書
      </div>
    </div>
    <div :class="classes.author">
      <cy-icon-text
        icon="potum"
        icon-src="custom"
        icon-width="1.5rem"
        icon-color="blue-30"
      />
      <div class="ml-2.5 text-xl text-blue-50">Cyteria</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useCssModule } from 'vue'

import HomeIconTitle from './home-icon-title.vue'

interface Props {
  rootEl: HTMLElement | null
}

defineProps<Props>()

const classes = useCssModule()
</script>

<style lang="postcss" module>
.icon-touched-text {
  @apply pointer-events-none fixed z-5 text-primary-50 opacity-0;
  animation: app-icon-touched-text 2.5s linear;
}

@keyframes app-icon-touched-text {
  0% {
    opacity: 1;
    transform: translate(0, 0);
  }
  100% {
    opacity: 0;
    transform: translate(0, -200%);
  }
}

.root {
  @apply absolute bottom-0 left-0 flex h-48 items-center duration-150;
  padding-left: calc((100% - 1024px) / 2 - 12rem);
  width: calc((100% - 1024px) / 2 - 1rem);

  &:hover {
    background: linear-gradient(
      to right,
      rgba(var(--app-rgb-white), 0.75) 0%,
      rgba(var(--app-rgb-white), 0.75) 75%,
      rgba(var(--app-rgb-white), 0.25) 100%
    );
    @apply z-50 w-full;

    & > .wrapper {
      background: linear-gradient(
        to bottom right,
        var(--app-blue-10) 0%,
        var(--app-primary-10) 100%
      );
    }

    & > .title {
      @apply w-full opacity-100;
    }

    & > .author {
      @apply opacity-100 duration-150;
      transition-delay: 0.75s;
    }
  }
}

.wrapper {
  @apply flex items-center rounded-full p-5 duration-150;
  transform: translate(0, 8%);
  background-color: rgba(var(--app-rgb-white), 0.5);
  animation: wrapper-floating ease 8s infinite;
}

.title {
  @apply w-0 overflow-hidden pl-12 opacity-0 duration-150;

  & > .sub {
    white-space: nowrap;
  }
}

.author {
  @apply absolute bottom-6 flex items-center opacity-0;
  right: calc((100% - 1024px) / 2 - 12rem);
}

@keyframes wrapper-floating {
  0% {
    transform: translate(0, 8%);
  }
  25% {
    transform: translate(0, -8%);
  }
  50% {
    transform: translate(0, 8%);
  }
  75% {
    transform: translate(0, -4%);
  }
  100% {
    transform: translate(0, 8%);
  }
}
</style>
