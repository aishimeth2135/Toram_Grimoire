<template>
  <div class="cy-button-dropdown-wrapper" :class="{ 'content-visble': contents.content }">
    <CyButtonBase
      v-slot="{ iconClass }"
      v-bind="buttonBaseBinds"
      class="cy-button-dropdown-main w-full"
      @click="toggle('contents/content')"
    >
      <ButtonIcon :icon="icon" :src="iconSrc" :class="iconClass" />
      <span class="mr-1" :class="icon !== null ? 'ml-2' : 'ml-1'">
        <slot />
      </span>
    </CyButtonBase>
    <div v-if="contents.content" class="pl-5">
      <slot name="content" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import ToggleService from '@/setup/ToggleService'

import CyButtonBase from './cy-button-base.vue'
import ButtonIcon from './button-icon.vue'

import { ButtonBaseProps, ButtonIconProps, getButtonBaseBinds } from './setup'

export default defineComponent({
  props: {
    ...ButtonBaseProps,
    ...ButtonIconProps,
    contentDefaultVisible: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { contents, toggle } = ToggleService({
      contents: [{ name: 'content', default: props.contentDefaultVisible }] as const,
    })
    return {
      contents,
      toggle,
    }
  },
  components: {
    CyButtonBase,
    ButtonIcon,
  },
  computed: {
    buttonBaseBinds() {
      const binds = getButtonBaseBinds(this)
      binds.selected = this.contents.content
      return binds
    },
  },
})
</script>

<style lang="postcss" scoped>
.cy-button-dropdown-wrapper {
  @apply border-l-2 border-primary-30 duration-200;

  &.content-visble {
    @apply border-primary-30;
  }
}

.cy-button-dropdown-main {
  @apply px-3 py-2;

  &:hover {
    background-color: rgba(var(--rgb-app-light), 0.25);
  }
}
</style>
