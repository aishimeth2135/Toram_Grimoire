<template>
	<div class="sticky-header">
		<div class="content">
			<slot></slot>
      <div v-if="$slots['float-menu']" class="float-menu">
        <slot name="float-menu"></slot>
      </div>
			<div class="buttons-scope">
				<slot name="buttons-scope"></slot>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
	};
</script>

<style lang="less" scoped>
	.sticky-header {
		--shadow-height: 1rem;
		--container-height: 4rem;
		--shadow-mask-color: var(--white);
		--primary-bgcolor: var(--white);
		--base-z-index: 10;
		position: sticky;
		top: calc(-1*var(--shadow-height));
		height: var(--container-height);
		z-index: var(--base-z-index);
		-webkit-backface-visibility: hidden;
		/* padding-top and padding-botton must be 0
		padding-top: 0;
		padding-bottom: 0; */
		margin-bottom: 1px;

		&:not(.transparent) {
			&::before, &::after {
				content: '';
				display: block;
				height: var(--shadow-height);
				position: sticky;
			}
			&::before {
				box-shadow: 0 0.2rem 0.4rem -0.2rem var(--primary-light-2);
				top: calc(var(--container-height) - 2*var(--shadow-height));
			}
			&::after {
				background-color: var(--shadow-mask-color);
				z-index: calc(1 + var(--base-z-index));
			}

			> .content {
				background-color: var(--primary-bgcolor);
			}
		}

		> .content {
			position: sticky;
			height: calc(var(--container-height) - var(--shadow-height));
			margin-top: calc(-1*var(--shadow-height));
			z-index: calc(var(--base-z-index) + 2);
			top: 0;
			display: flex;
			align-items: center;
			white-space: nowrap;
			overflow-y: visible;
      padding: 0 0.4rem;

      > .float-menu {
        position: absolute;
        top: 0.2rem;
        right: 0.1rem;
        z-index: 5;

        > .menu-container {
          padding: 0.6rem 1rem;
          padding-top: 2rem;
          border: 1px solid var(--primary-light-2);
          background-color: var(--white);
          width: 31.2rem;
          max-width: calc(100vw - 1rem);
          max-height: calc(100vh - 5rem);
          overflow-y: auto;
          white-space: normal;

          &.width-wide {
            width: 40rem;
          }
        }
      }

			> .buttons-scope {
				margin-left: auto;
        margin-right: 0.4rem;
        z-index: 6;
			}
		}
		&.bottom-border::after {
			border-top: 1px solid var(--primary-light);
		}
	}
</style>