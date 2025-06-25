<template>
  <div class="home-title-root">
    <HomeIconTitle class="home-title-wrapper" :root-el="rootEl" />
    <div class="home-title-title">
      <div class="home-title-sub text-4xl text-primary-70">Cy's Grimoire</div>
      <div class="home-title-sub mt-2 text-xl text-primary-40">布偶的魔法書</div>
    </div>
    <div class="home-title-author">
      <cy-icon icon="@potum" width="1.5rem" class="text-blue-30" />
      <div class="ml-2.5 text-xl text-blue-50">Cyteria</div>
    </div>
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
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  height: --spacing(48);
  padding-left: calc((100% - 1024px) / 2 - 12rem);
  width: calc((100% - 1024px) / 2 - 1rem);
  transition-duration: 150ms;

  &:hover {
    background: linear-gradient(
      to right,
      --alpha(var(--app-white) / 75%) 0%,
      --alpha(var(--app-white) / 75%) 75%,
      --alpha(var(--app-white) / 25%) 100%
    );
    z-index: 50;
    width: 100%;

    & > .home-title-wrapper {
      background: linear-gradient(
        to bottom right,
        var(--app-blue-10) 0%,
        var(--app-primary-10) 100%
      );
    }

    & > .home-title-title {
      width: 100%;
      opacity: 1;
    }

    & > .home-title-author {
      transition-duration: 150ms;
      transition-delay: 0.75s;
      opacity: 1;
    }
  }
}

.home-title-wrapper {
  display: flex;
  align-items: center;
  border-radius: calc(infinity * 1px);
  padding: --spacing(5);
  transition-duration: 150ms;
  transform: translate(0, 8%);
  background-color: --alpha(var(--app-white) / 50%);
  animation: wrapper-floating ease 8s infinite;
}

.home-title-title {
  width: 0;
  overflow: hidden;
  padding-left: --spacing(12);
  opacity: 0;
  transition-duration: 150ms;

  & > .home-title-sub {
    white-space: nowrap;
  }
}

.home-title-author {
  position: absolute;
  bottom: --spacing(6);
  display: flex;
  align-items: center;
  opacity: 0;
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
