<template>
  <div class="home-title-root">
    <HomeIconTitle class="home-title-wrapper" :root-el="rootEl" />
    <div class="home-title-title">
      <div class="home-title-sub text-primary-70 text-4xl">Cy's Grimoire</div>
      <div class="home-title-sub text-primary-40 mt-2 text-xl">布偶的魔法書</div>
    </div>
    <div class="home-title-author text-xl text-blue-50">By. Cyteria</div>
  </div>
</template>

<script lang="ts" setup>
import HomeIconTitle from './home-icon-title.vue'

interface Props {
  rootEl: HTMLElement | null
}

defineProps<Props>()
</script>

<style>
@reference "@/tailwind.css";

.home-title-root {
  display: flex;
  position: absolute;
  bottom: 0;
  left: 0;
  align-items: center;
  transition-duration: 150ms;
  padding-left: calc((100% - 1024px) / 2 - 12rem);
  width: calc((100% - 1024px) / 2 - 1rem);
  height: --spacing(48);

  &:hover {
    z-index: 50;
    background: linear-gradient(
      to right,
      --alpha(var(--app-white) / 75%) 0%,
      --alpha(var(--app-white) / 75%) 75%,
      --alpha(var(--app-white) / 25%) 100%
    );
    width: 100%;

    & > .home-title-wrapper {
      background: linear-gradient(
        to bottom right,
        var(--app-blue-10) 0%,
        var(--app-primary-10) 100%
      );
    }

    & > .home-title-title {
      opacity: 1;
      width: 100%;
    }

    & > .home-title-author {
      opacity: 1;
      transition-delay: 0.75s;
      transition-duration: 150ms;
    }
  }
}

.home-title-wrapper {
  display: flex;
  align-items: center;
  transform: translate(0, 8%);
  animation: wrapper-floating ease 8s infinite;
  transition-duration: 150ms;
  border-radius: calc(infinity * 1px);
  background-color: --alpha(var(--app-white) / 50%);
  padding: --spacing(5);
}

.home-title-title {
  opacity: 0;
  transition-duration: 150ms;
  padding-left: --spacing(12);
  width: 0;
  overflow: hidden;

  & > .home-title-sub {
    white-space: nowrap;
  }
}

.home-title-author {
  display: flex;
  position: absolute;
  right: calc((100% - 1024px) / 2 - 12rem);
  bottom: --spacing(6);
  align-items: center;
  opacity: 0;
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
