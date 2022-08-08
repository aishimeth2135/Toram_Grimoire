<template>
  <div class="inline-block mx-5 my-3">
    <router-link v-slot="{ navigate }" :to="{ name: data.pathName }" custom>
      <div
        class="cy--home-link-button"
        role="link"
        @click="navigate"
      >
        <div class="text-lg text-center text-dark-light pl-6 pr-10">
          {{ t('app.page-title.' + data.name) }}
        </div>
        <div class="cy--home-link-button-underline"></div>
        <cy-icon-text
          :icon="data.icon"
          icon-width="1.5rem"
          icon-color="light-2"
          class="cy--home-link-button-icon"
        />
      </div>
    </router-link>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import { AppRouteNames } from '@/router/enums'

interface Props {
  data: {
    pathName: AppRouteNames;
    name: string;
    icon: string;
  };
}

defineProps<Props>()

const { t } = useI18n()
</script>

<style lang="postcss" scoped>
.content-title:hover {
  @apply border-light-3;
  & > .router-link-icon {
    @apply text-light-3;
    animation: move-rotate 1.3s ease;
  }
}
@keyframes move-rotate {
  0% {
    top: 3.1rem;
    left: 3.1rem;
    transform: rotate(-135deg) translateX(4.5rem) rotate(135deg);
  }
  100% {
    top: 3.1rem;
    left: 3.1rem;
    transform: rotate(225deg) translateX(4.5rem) rotate(-225deg);
  }
}

.cy--home-link-button {
  @apply py-2 relative cursor-pointer;

  & > .cy--home-link-button-underline {
    @apply h-1 rounded-full bg-light mt-1 duration-200;
  }

  & > .cy--home-link-button-icon {
    @apply absolute top-0 right-1 duration-200;
  }

  &:hover {
    & > .cy--home-link-button-underline {
      @apply bg-light-2;
    }
    & > .cy--home-link-button-icon {
      @apply rotate-12;
    }
  }

  @media screen and (max-width: 17.5rem) {
    max-width: 100%;
  }
}
</style>
