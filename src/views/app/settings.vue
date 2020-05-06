<template>
  <span class="app--settings">
    <cy-button type="icon-only" iconify-name="ic-baseline-settings" @click="toggleWindowVisible" />
    <cy-window class="width-wide main--window" @close-window="toggleWindowVisible"
      :visible="windowVisible" iconify-name="ic-baseline-settings">
      <template v-slot:title>{{ langText('title') }}</template>
      <div class="column">
        <div class="title">
          <cy-icon-text iconify-name="ic-round-text-fields">
            {{ langText('switch font/title') }}
          </cy-icon-text>
        </div>
        <div class="caption">{{ langText('switch font/caption') }}</div>
        <cy-icon-text class="text-small warn" iconify-name="bx-bx-error-circle">{{ langText('switch font/warn 1') }}</cy-icon-text>
        <div class="buttons">
          <cy-button iconify-name="ic-round-text-fields" :class="{ 'selected': currentFont == 0 }"
            @click="switchFont(0)">
            {{ langText('switch font/default font') }}
          </cy-button>
          <cy-button iconify-name="ic-round-text-fields" :class="{ 'selected': currentFont == 1 }"
            @click="switchFont(1)">
            {{ langText('switch font/base font') }}
          </cy-button>
        </div>
      </div>
      <div class="column">
        <div class="title">
          <cy-icon-text iconify-name="ion-language">
            {{ langText('language/title') }}
          </cy-icon-text>
        </div>
        <div class="caption">
          {{ langText('language/caption') }}
        </div>
        <cy-icon-text class="text-small warn" iconify-name="bx-bx-error-circle">{{ langText('language/warn 1') }}</cy-icon-text>
        <cy-icon-text class="text-small warn" iconify-name="bx-bx-error-circle">{{ langText('language/warn 2') }}</cy-icon-text>
        <div class="buttons">
          <cy-button v-for="(item, i) in languageState.list" iconify-name="ion-language"
            :class="{ 'selected': languageState.currentIndex == i }"
            :key="item" @click="setLanguage('second-language', i)">
            {{ langText('language/button texts/lang ' + item) }}
          </cy-button>
        </div>
      </div>
      <div class="column">
        <div class="title">
          <cy-icon-text iconify-name="ion-language">
            {{ langText('second language/title') }}
          </cy-icon-text>
        </div>
        <div class="caption">
          {{ langText('second language/caption') }}
        </div>
        <cy-icon-text class="text-small warn" iconify-name="bx-bx-error-circle">{{ langText('second language/warn 1') }}</cy-icon-text>
        <cy-icon-text class="text-small warn" iconify-name="bx-bx-error-circle">{{ langText('second language/warn 2') }}</cy-icon-text>
        <div class="buttons">
          <cy-button v-for="(item, i) in secondLanguageState.list" iconify-name="ion-language"
            :class="{ 'selected': secondLanguageState.currentIndex == i }"
            :key="item" @click="setLanguage('second-language', i)">
            {{ langText('language/button texts/lang ' + item) }}
          </cy-button>
        </div>
      </div>
    </cy-window>
  </span>
</template>

<script>
  import CY from "@global-modules/cyteria.js";
  import GetLang from "@global-modules/LanguageSystem.js";

  export default {
    data(){
      const list1 = ['auto', '0', '1', '2', '3'],
        list2 = ['0', '1', '2', '3'];
      return {
        windowVisible: false,
        currentFont: localStorage['app--font-family'] !== '1' ? 0 : 1,
        languageState: {
          list: list1,
          currentIndex: list1.indexOf(localStorage['app--language'])
        },
        secondLanguageState: {
          list: list2,
          currentIndex: list2.indexOf(localStorage['app--second-language'])
        }
      };
    },
    computed: {
    },
    methods: {
      setLanguage(target, index){
        const state = target == 'language' ? languageState : secondLanguageState;
        state.list.currentIndex = index;
        localStorage['app--' + target] = state.list[index];
      },
      switchFont(id){
        localStorage['app--font-family'] = id.toString();
        document.body.classList.toggle('font1', id == 0);
        this.currentFont = id;
      },
      toggleWindowVisible(){
        this.windowVisible = !this.windowVisible;
      },
      langText(v, vs){
        return GetLang('Settings/' + v, vs);
      }
    }
  }
</script>

<style lang="less" scoped>
  @deep-operator: ~'>>>';

  .app--settings {
    padding: 1rem 0;

    > .main--window {
      @{deep-operator} .column {
        padding: 0.4rem 1.2rem;
        border-left: 2px var(--primary-light-3) solid;
        margin: 0.8rem 0;

        > .title {
          margin-bottom: 0.3rem;
          color: var(--primary-purple);
        }

        > .caption {
          margin-bottom: 0.4rem;
        }

        > .warn {
          color: var(--primary-light-4);
        }

        > .buttons {
          padding: 0.2rem;
          padding-bottom: 0;
        }
      }
    }
  }
</style>