<template>
  <article>
    <section>
      <div
        v-for="column in datas.columns"
        :key="column.title"
        class="cy--about-column flex p-4 bg-white rounded-md m-4 border-1 border-transparent hover:border-light-2 duration-300"
      >
        <div class="flex items-center justify-center w-24 h-24 relative flex-shrink-0 rounded-full mr-3 mb-4 border-1 border-solid border-light-3 bg-white">
          <div>{{ t(`app.about.${column.title}.title`) }}</div>
          <cy-icon-text
            icon="mdi-leaf"
            style="--icon-width: 2rem; position: absolute;"
            class="-top-1 -left-1"
          />
        </div>
        <div class="pl-3 mt-2">
          <div class="text-sm text-purple mb-3">
            <div>{{ t(`app.about.${column.title}.sub-title`) }}</div>
          </div>
          <div v-for="item in column.list" :key="item.title" class="mx-3">
            <div
              v-if="!item.title.startsWith('@')"
              class="text-sm text-light-3"
            >
              {{ t(`app.about.${column.title}.${item.title}`) }}
            </div>
            <div class="py-2 pl-4">
              <template
                v-for="value in item.list"
                :key="typeof value === 'object' ? `${value.main}|${value.sub}` : value"
              >
                <template v-if="(typeof value === 'string') && value.startsWith('@')">
                  <div v-if="value === '@line'" class="my-2.5" />
                  <div v-if="value === '@end'" class="mb-3" />
                </template>
                <span
                  v-else
                  class="inline-flex pr-3"
                >
                  <cy-icon-text
                    icon="mdi-leaf"
                    style="--icon-width: 0.8rem;"
                    class="mr-1 self-start"
                  />
                  <span v-if="(typeof value === 'string')">{{ value }}</span>
                  <span v-else class="inline-flex items-center flex-wrap">
                    <span>{{ value.main }}</span>
                    <span class="px-2 ml-2 text-water-blue border-l border-r border-solid border-water-blue">{{ value.sub }}</span>
                  </span>
                </span>
              </template>
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

<script lang="ts">
const ABOUT_DATAS = {
  columns: [{
    title: 'author',
    list: [{
      title: 'toram-id',
      list: ['Cyteria'],
    }],
  }, {
    title: 'team',
    list: [{
      title: 'skill-data',
      list: ['緋月音', '(Discord) Phantom\'s Library'],
    }, {
      title: 'equipment-data',
      list: ['緋月音', '真白', '萌月'],
    }, {
      title: 'other',
      list: ['萌月', '太極魚'],
    }],
  }, {
    title: 'donate',
    list: [{
      title: 'group',
      list: [{
        main: '曼珠沙華',
        sub: '眾神幣',
      }, '@line', {
        main: '被世人遺忘的角落',
        sub: '眾神幣',
      }, '@line', {
        main: '奇鴉譜月',
        sub: '眾神幣',
      }, '@end'],
    }, {
      title: 'donor',
      list: [{
        main: '繆絢ゞ',
        sub: '眾神幣',
      }, {
        main: '憂子迷',
        sub: '眾神幣',
      }, {
        main: 'Miriam魚蔥',
        sub: '眾神幣',
      }, '@line', {
        main: '溫柔善良大方得體的匿名者',
        sub: '單手劍穿孔0~2',
      }, '@line', {
        main: '律',
        sub: '眾神幣',
      }, '@line', {
        main: '曄痕/櫻雨痕',
        sub: '眾神幣',
      }, {
        main: '夜神散華 禮彌/（曄之妹）',
        sub: '眾神幣',
      }, '@line', {
        main: '✩cuxin',
        sub: '眾神幣',
      }, {
        main: '紺野木綿季、優紀',
        sub: '眾神幣',
      }, '@end'],
    }],
  }, {
    title: 'words',
    list: [{
      title: '@1',
      list: ['若有任何聯繫作者的需要，可於巴哈姆特或Twitter私訊。也可以於遊戲中進行私訊，本人比較常在信天翁之巢出沒。'],
    }, {
      title: '@2',
      list: ['如果有任何意見、問題或疑似BUG的情形，都歡迎聯繫作者。'],
    }, {
      title: '@3',
      list: ['如果有意願協助資料上的測試、輸入或翻譯，或有意願贊助（遊戲內的資源），也歡迎洽詢作者。'],
    }],
  }],
}

export default {
  name: 'AppAbout',
}
</script>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const datas = ABOUT_DATAS
const { t } = useI18n()
</script>

<style lang="less" scoped>
.cy--about-column {
  @media screen and (max-width: 50rem) {
    flex-wrap: wrap;
  }
}
</style>
