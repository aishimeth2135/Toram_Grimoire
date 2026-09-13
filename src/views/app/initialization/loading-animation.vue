<template>
  <transition mode="out-in" name="logo-fade" @after-leave="emit('done')">
    <div v-if="!available" class="flex">
      <cy-icon
        key="1"
        icon="@grimoire-cat"
        class="custom-icon wd:size-16 custom-icon-start size-12"
      />
    </div>
    <div v-else class="flex">
      <cy-icon
        key="1"
        icon="@grimoire-cat"
        class="custom-icon wd:size-16 custom-icon-start size-12"
      />
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, toRefs, watch } from 'vue'

import { InitializeStatus } from '@/stores/app/initialize/enums'
import { useMainStore } from '@/stores/app/main'

interface Props {
  status: number
}
interface Emits {
  (evt: 'done'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { status } = toRefs(props)
const mainStore = useMainStore()

const innerStatus = ref(0)

const available = computed(() => {
  return innerStatus.value >= InitializeStatus.BeforeFinished && !mainStore.routerGuiding
})

onMounted(() => {
  innerStatus.value = status.value
  watch(status, value => (innerStatus.value = value))
})
</script>

<style scoped>
.custom-icon {
  color: var(--app-primary-30);

  &.custom-icon-start {
    animation: loading-page-main-icon ease 4s infinite;
  }
}

@keyframes loading-page-main-icon {
  0% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(0, -8%);
  }
  50% {
    transform: translate(0, 8%);
  }
  75% {
    transform: translate(0, -6%);
  }
  100% {
    transform: translate(0, 0);
  }
}

.logo-fade-leave-active {
  transition: opacity 0.5s ease;
}
.logo-fade-leave-from {
  opacity: 1;
}
.logo-fade-leave-to {
  opacity: 0;
}
</style>
