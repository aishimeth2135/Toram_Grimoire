<template>
  <div class="cy--top-header">
    <div class="top-header-content">
      <slot />
    </div>
  </div>
</template>

<style>
.cy--top-header {
  --shadow-height: 0.5rem;
  --container-height: 3.5rem;
  --shadow-mask-color: var(--app-white);
  --app-bgcolor: var(--app-white);
  --base-z-index: 15;
  position: sticky;
  top: calc(-1 * var(--shadow-height));
  z-index: var(--base-z-index);
  margin-top: var(--shadow-height);
  margin-bottom: 1px;
  height: var(--container-height);

  &:not(.transparent) {
    &::before {
      display: block;
      position: sticky;
      top: calc(var(--container-height) - 2 * var(--shadow-height));
      box-shadow: 0 0.2rem 0.4rem -0.2rem var(--app-primary-30);
      height: var(--shadow-height);
      content: '';
    }

    & > .top-header-content {
      border-radius: 0.5rem 0.5rem 0 0;
      background-color: var(--app-bgcolor);
    }
  }

  & > .top-header-content {
    display: flex;
    position: sticky;
    top: 0;
    align-items: center;
    z-index: calc(var(--base-z-index) + 2);
    margin-top: calc(-1 * var(--shadow-height));
    padding-right: 0.75rem;
    padding-left: 0.75rem;
    height: calc(var(--container-height) - var(--shadow-height));
    overflow-y: visible;
    white-space: nowrap;
  }
}
</style>
