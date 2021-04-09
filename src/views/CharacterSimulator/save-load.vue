<template>
  <div v-if="storageAvailable">
    <div class="content">
      <cy-default-tips iconify-name="bx-bx-message-square-dots" text-align="left">
        {{ localLangText('top caption') }}
      </cy-default-tips>
      <div class="buttons">
        <cy-button type="border" iconify-name="ic-round-save"
          @click="$emit('manual-auto-save')">
          {{ localLangText('save button: title') }}
        </cy-button>
        <cy-button type="border" iconify-name="bx-bx-loader-circle"
          @click="$emit('manual-auto-load')">
          {{ localLangText('load button: title') }}
        </cy-button>
      </div>
    </div>
    <div class="content">
      <cy-default-tips iconify-name="mdi-food-apple-outline" text-align="left">
        <div>{{ localLangText('delete all data: caption')[0] }}</div>
        <cy-icon-text iconify-name="ic-outline-info" text-color="light-3" text-size="small" class="tip">
          {{ localLangText('delete all data: caption')[1] }}
        </cy-icon-text>
        <cy-icon-text iconify-name="ic-outline-info" text-color="light-3" text-size="small" class="tip">
          {{ localLangText('delete all data: caption')[2] }}
        </cy-icon-text>
      </cy-default-tips>
      <div class="buttons">
        <cy-input-counter :value="deleteCounter" @set-value="v => deleteCounter = v">
          <template #title>
            <cy-icon-text iconify-name="ic-round-delete">
              {{ localLangText('delete counter: title') }}
            </cy-icon-text>
          </template>
        </cy-input-counter>
        <cy-button v-if="deleteCounter == 10" type="border" iconify-name="ic-round-delete"
          style="margin-top: 0.6rem;" @click="deleteAllSavedData">
          {{ localLangText('button: deleta all data') }}
        </cy-button>
      </div>
    </div>
  </div>
  <cy-default-tips v-else iconify-name="mdi-ghost">
    {{ globalLangText('global/LocalStorage is inavailable') }}
  </cy-default-tips>
</template>
<script>
import CY from "@Util/Cyteria";
import MessageNotify from "@Service/Notify";

export default {
  data() {
    return {
      deleteCounter: 0
    }
  },
  inject: ['langText', 'globalLangText'],
  computed: {
    storageAvailable() {
      return CY.storageAvailable('localStorage');
    },
    // ...Vuex.mapState('character', ['deleteAllSavedDataBackup'])
  },
  methods: {
    deleteAllSavedData() {
      this.$store.commit('character/deleteAllSavedData');
      this.$emit('close-auto-save');
      MessageNotify(this.localLangText('Message: deleta all data'));
    },
    localLangText(v, vs) {
      return this.langText('save-load control/' + v, vs);
    }
  }
};
</script>
<style lang="less" scoped>
.content {
  & + & {
    border-top: 1px solid var(--primary-light);
    margin-top: 0.8rem;
  }

  > .buttons {
    padding-left: 0.8rem;
  }

  .tip {
    margin-top: 0.6rem;
  }
}
</style>