<template>
  <div v-if="items.length !== 0"
    class="fixed w-full h-full z-100 top-0 left-0">
    <div class="absolute w-full h-full bg-black opacity-30 z-n1"></div>
    <div class="w-full h-full flex items-center justify-center">
      <div class="w-full max-w-sm max-h-full overflow-y-auto border border-light-2 bg-white p-6 m-4 animate-slide-up">
        <div class="mb-6 flex">
          <div v-if="item.icon">
            <cy-icon-text v-if="(typeof item.icon === 'string')"
              :icon="item.icon"
              style="--icon-width: 2rem"
              class="flex-shrink-0 mr-4" />
          </div>
          <div>
            {{ item.message }}
          </div>
        </div>
        <div class="flex items-center">
          <cy-button-border
            icon="line-md:confirm-circle"
            class="ml-auto"
            @click="confirm"
          >
            {{ $globalLang('global/confirm') }}
          </cy-button-border>
          <cy-button-border
            icon="ic-round-cancel"
            type="border"
            main-color="gray"
            @click="cancel"
          >
            {{ $globalLang('global/cancel') }}
          </cy-button-border>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";

export default {
  computed: {
    ...mapState('confirm', ['items']),
    item() {
      return this.items[0];
    }
  },
  methods: {
    confirm() {
      this.item.confirm();
      this.shiftItem();
    },
    cancel() {
      this.shiftItem();
    },
    shiftItem() {
      this.$store.commit('confirm/shiftItem');
    }
  }
}
</script>