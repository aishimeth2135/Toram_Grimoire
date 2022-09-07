<template>
  <teleport to="#app-notify">
    <div class="fixed bottom-14 right-5 w-80 z-100" style="max-width: calc(100vw - 2rem)">
      <transition-group name="fade-slide">
        <div
          v-for="msg in store.messages"
          :key="msg.iid"
          class="duration-300 bg-dark text-white p-3 flex items-center mt-4 rounded w-full flex-wrap relative"
        >
          <span
            v-if="msg.counter > 1"
            class="inline-flex justify-center items-center w-8 h-8 bg-dark rounded-full border border-solid border-primary-30 text-primary-30 absolute -right-4 -top-4"
          >
            <span>{{ msg.counter }}</span>
          </span>
          <div class="inline-flex items-center">
            <cy-icon-text
              :icon="msg.icon"
              icon-color="primary-5"
              class="mr-3"
            />
            <span class="text">{{ msg.message }}</span>
          </div>
          <div v-if="msg.options.buttons?.length !== 0">
            <span
              v-for="btn in msg.options.buttons"
              :key="btn.iid"
              class="cursor-pointer ml-3 text-primary-30 text-right hover:text-primary-30"
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
import type { NotifyMessageItem, MessageNotifyButtonItemWithId } from '@/stores/app/notify'

const store = useNotifyStore()

const messageButtonClick = (msg: NotifyMessageItem, btn: MessageNotifyButtonItemWithId) => {
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
