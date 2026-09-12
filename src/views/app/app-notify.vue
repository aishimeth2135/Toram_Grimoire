<template>
  <teleport to="#app-notify">
    <div class="z-100 fixed bottom-14 right-5 w-80" style="max-width: calc(100vw - 2rem)">
      <transition-group name="fade-slide">
        <div
          v-for="msg in store.messages"
          :key="msg.iid"
          class="bg-primary-90 relative mt-4 flex w-full flex-wrap items-center rounded-sm p-3 text-white duration-300"
        >
          <span
            v-if="msg.counter > 1"
            class="border-primary-30 bg-primary-90 text-primary-30 absolute -right-4 -top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-solid"
          >
            <span>{{ msg.counter }}</span>
          </span>
          <div class="inline-flex items-center">
            <cy-icon :icon="msg.icon" class="text-primary-5 mr-3" />
            {{ msg.message }}
          </div>
          <div v-if="msg.options.actions?.length">
            <span
              v-for="action in msg.options.actions"
              :key="action.iid"
              class="text-primary-30 hover:text-primary-30 ml-3 cursor-pointer text-right"
              @click="messageActionClick(msg, action)"
            >
              {{ action.label }}
            </span>
          </div>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script lang="ts" setup>
import { useNotifyStore } from '@/stores/app/notify'
import type { MessageNotifyActionWithId, NotifyMessageItem } from '@/stores/app/notify'

const store = useNotifyStore()

const messageActionClick = (msg: NotifyMessageItem, action: MessageNotifyActionWithId) => {
  const shouldDismiss = action.onClick() !== false
  if (shouldDismiss && action.dismissOnClick !== false) {
    store.removeMessage(msg)
  }
}
</script>

<style scoped>
.fade-slide-enter-from {
  transform: translateX(-30%);
  opacity: 0;
}
.fade-slide-leave-to {
  transform: translateX(30%);
  opacity: 0;
}
</style>
