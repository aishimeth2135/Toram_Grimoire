<template>
  <div class="cy--top-header">
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CyTopHeader',
}
</script>

<style lang="postcss" scoped>
.cy--top-header {
	--shadow-height: 0.5rem;
	--container-height: 3.5rem;
	--shadow-mask-color: var(--app-white);
	--app-bgcolor: var(--app-white);
	--base-z-index: 15;
	position: sticky;
	top: calc(-1 * var(--shadow-height));
	height: var(--container-height);
	z-index: var(--base-z-index);
	margin-bottom: 1px;
	margin-top: var(--shadow-height);

	&:not(.transparent) {
		&::before {
			content: '';
			display: block;
			height: var(--shadow-height);
			position: sticky;
			box-shadow: 0 0.2rem 0.4rem -0.2rem var(--app-primary-30);
			top: calc(var(--container-height) - 2 * var(--shadow-height));
		}

		& > .content {
			background-color: var(--app-bgcolor);
			border-radius: 0.5rem 0.5rem 0 0;
		}
	}

	& > .content {
		position: sticky;
		height: calc(var(--container-height) - var(--shadow-height));
		margin-top: calc(-1 * var(--shadow-height));
		z-index: calc(var(--base-z-index) + 2);
		top: 0;
		display: flex;
		align-items: center;
		white-space: nowrap;
		overflow-y: visible;
		@apply px-3;
	}
}
</style>
