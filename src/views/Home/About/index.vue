<template>
  <article>
    <section>
      <div v-for="c in columns" :key="c.title"
        class="column flex p-4 border-b border-solid border-light">
        <div class="flex items-center justify-center w-24 h-24 relative flex-shrink-0 rounded-full mr-3 mb-4 border-1 border-solid border-light-3">
          <div>{{ $lang(c.title + '/title') }}</div>
          <cy-icon-text icon="mdi-leaf"
            style="--icon-width: 2rem;"
            class="absolute -top-1.5 -left-1.5" />
        </div>
        <div class="pl-3">
          <div class="text-sm text-purple mb-3">{{ $lang(c.title + '/sub title') }}</div>
          <div class="mx-3" v-for="item in c.list" :key="item.title">
            <div class="text-sm text-light-3" v-if="item.title">{{ $lang(c.title + '/' + item.title) }}</div>
            <div class="py-2 pl-4">
              <span v-for="v in item.list"
                :key="typeof v === 'object' ? `${v.main}|${v.sub}` : v"
                class="inline-flex pr-3">
                <cy-icon-text icon="mdi-leaf"
                  style="--icon-width: 0.8rem;"
                 class="mr-1 self-start" />
                <span v-if="typeof v == 'string'">{{ v }}</span>
                <template v-else>
                  <span>{{ v.main }}</span>
                  <span class="px-2 ml-2 text-water-blue border-l border-r border-solid border-water-blue">{{ v.sub }}</span>
                </template>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="py-4 px-3">
      <div class="content">
        托蘭異世錄為<a class="text-light-3 underline" href="https://asobimo.com/" target="_blank">アソビモ株式会社（ASOBIMO,Inc.）</a>所營運之遊戲。本網站只是一個分享資料的小地方。
      </div>
    </section>
  </article>
</template>

<script>
  import init from "./init.js";

  export default {
    RegisterLang: 'About',
    data(){
      return {
        columns: [{
          title: 'author',
          list: [{
            title: 'toram id',
            list: ['Cyteria']
          }]
        }, {
          title: 'team',
          list: [{
            title: 'skill data',
            list: ['緋月音']
          }, {
            title: 'equipment data',
            list: ['緋月音', '真白', '萌月']
          }, {
            title: 'ohter',
            list: ['萌月', '太極魚']
          }]
        }, {
          title: 'donate',
          list: [{
            title: 'group',
            list: [{
              main: '曼珠沙華',
              sub: '眾神幣'
            }, {
              main: '被世人遺忘的角落',
              sub: '眾神幣'
            }]
          }, {
            title: 'donor',
            list: [{
              main: '繆絢ゞ',
              sub: '眾神幣'
            }, {
              main: '憂子迷',
              sub: '眾神幣'
            }, {
              main: 'Miriam魚蔥',
              sub: '眾神幣'
            }, {
              main: '溫柔善良大方得體的匿名者',
              sub: '單手劍穿孔0~2'
            }, {
              main: '律',
              sub: '眾神幣'
            }]
          }]
        }, {
          title: 'words',
          list: [{
            list: ['若有任何聯繫作者的需要，可於巴哈姆特或Twitter私訊。也可以於遊戲中進行私訊，本人比較常在信天翁之巢出沒。']
          }, {
            list: ['如果有任何意見、問題或疑似BUG的情形，都歡迎聯繫作者。']
          }, {
            list: ['如果有意願協助資料上的測試、輸入或翻譯，或有意願贊助（遊戲內的資源），也歡迎洽詢作者。']
          }]
        }]
      };
    },
    beforeCreate(){
      init();
    }
  };
</script>

<style lang="less" scoped>
.column {
  @media screen and (max-width: 50rem) {
    flex-wrap: wrap;
  }
}
</style>