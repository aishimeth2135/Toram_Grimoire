<template>
  <article>
    <section>
      <div v-for="(c, i) in columns" class="column">
        <div class="title">
          <div>{{ langText(c.title + '/title') }}</div>
          <cy-icon-text iconify-name="mdi-leaf" class="fix-icon" />
        </div>
        <div class="content">
          <div class="sub-title">{{ langText(c.title + '/sub title') }}</div>
          <div class="list-item" v-for="(item, j) in c.list">
            <div class="title" v-if="item.title">{{ langText(c.title + '/' + item.title) }}</div>
            <div class="content">
              <span v-for="(v, k) in item.list">
                <cy-icon-text iconify-name="mdi-leaf" class="icon" />
                <span v-if="typeof v == 'string'">{{ v }}</span>
                <template v-else>
                  <span class="main">{{ v.main }}</span>
                  <span class="sub">{{ v.sub }}</span>
                </template>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="bottom">
      <div class="content">托蘭異世錄為<a href="https://asobimo.com/" target="_blank">アソビモ株式会社（ASOBIMO,Inc.）</a>所營運之遊戲。本網站只是一個分享資料的小地方。</div>
    </section>
  </article>
</template>

<script>
  import GetLang from "@global-modules/LanguageSystem.js";

  import init from "./init.js";

  export default {
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
    },
    methods: {
      langText(v, vs){
        return GetLang('About/' + v, vs);
      }
    }
  };
</script>

<style lang="less" scoped>
.bottom {
  padding: 1.2rem 0.4rem;
}
.column {
  display: flex;
  border-bottom: 1px solid var(--primary-light);
  padding: 1rem;

  @media screen and (max-width: 50rem) {
    flex-wrap: wrap;
  }

  > .title {
    flex-shrink: 0;
    border: 2px solid var(--primary-light-3);
    position: relative;
    width: 6rem;
    height: 6rem;
    border-radius: 50%;
    margin-right: 0.7rem;
    margin-bottom: 1rem;

    display: flex;
    align-items: center;
    justify-content: center;

    > .fix-icon {
      position: absolute;
      --icon-width: 2rem;
      top: -0.3rem;
      left: -0.3rem;
    }
  }

  > .content {
    padding-left: 0.7rem;
    > .sub-title {
      font-size: 0.9rem;
      color: var(--primary-purple);
    }
    > .list-item {
      margin: 0.8rem 0;
      > .title {
        font-size: 0.9rem;
        color: var(--primary-light-3);
      }

      > .content {
        padding: 0.4rem 0;
        padding-left: 1rem;

        > span {
          display: inline-flex;
          margin-right: 0.8rem;

          > .icon {
            --icon-width: 0.8rem;
            margin-right: 0.2rem;
            align-self: flex-start;
          }

          > .sub {
            border-left: 1px solid var(--primary-water-blue);
            border-right: 1px solid var(--primary-water-blue);
            color: var(--primary-water-blue);
            padding: 0 0.4rem;
            margin-left: 0.4rem;
          }
        }
      }
    }
  }
}
</style>