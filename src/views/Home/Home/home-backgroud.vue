<template>
  <div class="absolute left-0 top-0 h-full w-full overflow-hidden">
    <div class="app-home-background" />
  </div>
</template>

<style>
@reference "@/tailwind.css";

.app-home-background {
  position: absolute;
  right: --spacing(0);
  bottom: --spacing(0);
  background: linear-gradient(
    to bottom right,
    transparent 0%,
    transparent 10%,
    var(--app-primary-20) 100%
  );
  width: 100%;
  height: 100%;

  &::before {
    position: absolute;
    top: -65vw;
    left: 0;
    background: radial-gradient(
      circle at 0% 0%,
      var(--app-blue-20) 0%,
      var(--app-blue-20) 30%,
      transparent 70%,
      transparent 100%
    );
    width: 100vw;
    height: 100vw;
    content: '';
  }

  &::after {
    position: absolute;
    top: -32vw;
    right: 0vw;
    background: radial-gradient(
      circle at 100% 0%,
      var(--app-blue-20) 0%,
      var(--app-blue-20) 8%,
      transparent 50%,
      transparent 100%
    );
    width: 100vw;
    height: 100vw;
    content: '';
  }
}
</style>
