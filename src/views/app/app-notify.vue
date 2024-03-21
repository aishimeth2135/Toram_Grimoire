<template>
  <teleport to="#app-notify">
    <div
      class="fixed bottom-14 right-5 z-100 w-80"
      style="max-width: calc(100vw - 2rem)"
    >
      <transition-group name="fade-slide">
        <div
          v-for="msg in store.messages"
          :key="msg.iid"
          class="relative mt-4 flex w-full flex-wrap items-center rounded bg-primary-90 p-3 text-white duration-300"
        >
          <span
            v-if="msg.counter > 1"
            class="absolute -right-4 -top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-solid border-primary-30 bg-primary-90 text-primary-30"
          >
            <span>{{ msg.counter }}</span>
          </span>
          <div class="inline-flex items-center">
            <cy-icon :icon="msg.icon" class="mr-3 text-primary-5" />
            {{ msg.message }}
          </div>
          <div v-if="msg.options.buttons?.length !== 0">
            <span
              v-for="btn in msg.options.buttons"
              :key="btn.iid"
              class="ml-3 cursor-pointer text-right text-primary-30 hover:text-primary-30"
              @click="messageButtonClick(msg, btn)"
            >
              {{ btn.text || '|' + btn.iid + '|' }}
            </span>
          </div>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script lang="ts">
export default {
  name: 'AppNotify',
}
</script>

<script lang="ts" setup>
import { useNotifyStore } from '@/stores/app/notify'
import type {
  MessageNotifyButtonItemWithId,
  NotifyMessageItem,
} from '@/stores/app/notify'

const store = useNotifyStore()

const messageButtonClick = (
  msg: NotifyMessageItem,
  btn: MessageNotifyButtonItemWithId
) => {
  btn?.click()
  if (btn.removeMessageAfterClick) {
    store.removeMessage(msg)
  }
}
</script>

<style lang="postcss" scoped>
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-30%);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(30%);
}
</style>
