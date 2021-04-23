<template>
  <article>
    <div class="main" v-if="currentSkillRootState">
      <cy-sticky-header class="top transparent">
        <template v-slot:buttons-scope>
          <cy-button type="icon" @click="openJumpSkillTree"
            :selected="jumpSkillTreeVisible"
            iconify-name="dashicons:flag" />
          <cy-button type="icon" @click="openSelectSkillTree"
            :selected="selectSkillTreeVisible"
            iconify-name="ic:round-library-add" />
          <cy-button type="icon" @click="openBuildInformation"
            :selected="buildInformationVisible"
            :iconify-name="buildInformationVisible ? 'ic-round-keyboard-arrow-up' : 'ic-round-keyboard-arrow-down'" />
        </template>
        <cy-transition type="fade">
          <div class="inner-menu select-skill-tree" v-if="selectSkillTreeVisible">
            <template v-for="stc in unemptySkillTreeCategoryStates"
              :key="stc.origin.id">
              <div class="title">{{ stc.origin.name }}</div>
              <div class="content">
                <cy-button v-for="st in stc.skillTreeStates"
                  type="line" icon-id="rabbit-book"
                  :key="stc.origin.id + '-' + st.origin.id"
                  @click="toggleSkillTreeVisible(stc, st)"
                  :class="{ selected: st.visible }">
                  {{ st.origin.name }}
                  <template v-slot:content-right>
                    <cy-icon-text iconify-name="mdi:done" v-show="st.visible" />
                  </template>
                </cy-button>
              </div>
            </template>
          </div>
        </cy-transition>
        <cy-transition type="fade">
          <div class="inner-menu" v-show="jumpSkillTreeVisible">
            <cy-default-tips v-if="noSkillTreeSelected" iconify-name="mdi:ghost">
              {{ $lang('no skill tree selected') }}
            </cy-default-tips>
            <template v-else>
              <div class="top" style="margin-bottom: 0.8rem;">
                <cy-button iconify-name="ic:round-details" type="border"
                  @click="toggleJumpSkillTreeShowDetail">
                  {{ $lang(jumpSkillTreeShowDetail ?
                      'skill tree: show normal' : 'skill tree: show details') }}
                </cy-button>
              </div>
              <span v-if="jumpSkillTreeShowDetail" class="title">{{ $lang('main menu/star gem list') }}</span>
              <div v-show="jumpSkillTreeShowDetail && currentStarGemList.length != 0" class="content">
                <cy-button v-for="o in currentStarGemList" type="line" class="icon-small"
                  :key="'star-gem--' + o.skillTreeState.origin.id + '-' + o.skill.id"
                  @click="jumpToSkillTree(o.skillTreeState.origin)" iconify-name="mdi:judaism">
                  {{ o.skill.base.name }} Lv.{{ o.skill.starGemLevel() }}
                  <template v-slot:content-right>
                    <cy-icon-text iconify-name="mdi:judaism" class="text-small">
                      {{ o.skill.starGemLevel() - o.skill.level() }}
                    </cy-icon-text>
                  </template>
                </cy-button>
              </div>
              <cy-default-tips v-if="jumpSkillTreeShowDetail && currentStarGemList.length == 0"
                iconify-name="mdi:ghost">
                {{ $lang('no star gem set') }}
              </cy-default-tips>
              <template v-for="stc in visibleSkillTreeCategoryStates"
                :key="stc.origin.id">
                <div class="title">{{ stc.origin.name }}</div>
                <div class="content">
                  <cy-button v-for="st in stc.skillTreeStates.filter(p => p.visible)"
                    type="line" icon-id="rabbit-book" :key="'skill-tree--' + st.origin.id"
                    @click="jumpToSkillTree(st.origin)"
                    class="icon-small">
                    {{ st.origin.name }}
                    <template v-slot:content-right>
                      <cy-icon-text iconify-name="gg-shape-rhombus" class="text-small">
                        {{ skillTreeSkillPointCost(st) }}
                      </cy-icon-text>
                    </template>
                  </cy-button>
                </div>
              </template>
            </template>
          </div>
        </cy-transition>
        <cy-transition type="fade">
          <div class="inner-menu build-information" v-show="buildInformationVisible">
            <cy-options>
              <template #title>
                <cy-list-item>
                  <cy-icon-text iconify-name="ant-design:build-outlined">
                    {{ currentSkillRootState ?
                      currentSkillRootState.name : $lang('main menu/build name') }}
                  </cy-icon-text>
                </cy-list-item>
              </template>
              <template #options>
                <cy-list-item v-for="(state, i) in skillRootStates"
                  :key="state.stateId" :selected="currentSkillRootStateIndex == i"
                  @click="selectCurrentSkillRootState(i)">
                  <cy-icon-text iconify-name="ant-design:build-outlined">
                    {{ state.name }}
                  </cy-icon-text>
                </cy-list-item>
                <cy-list-item @click="createBuild">
                  <cy-icon-text iconify-name="ic:round-add-circle-outline" text-color="light-3">
                    {{ $lang('create build') }}
                  </cy-icon-text>
                </cy-list-item>
              </template>
            </cy-options>
            <cy-title-input iconify-name="ant-design:build-outlined"
              class="mt-4"
              v-model:value="currentSkillRootState.name" />
            <div class="p-2 mb-1">
              <cy-button type="line" @click="copyCurrentBuild" iconify-name="mdi:content-copy">
                {{ $globalLang('global/copy') }}
              </cy-button>
              <cy-button type="line" @click="deleteCurrentBuild" iconify-name="ic:round-delete-outline">
                {{ $globalLang('global/delete') }}
              </cy-button>
              <cy-button type="line" @click="exportCurrentBuildText" iconify-name="ic-round-text-fields">
                {{ $lang('export text') }}
              </cy-button>
              <cy-button type="line" @click="exportCurrentBuildImage" iconify-name="mdi:content-copy">
                {{ $lang('export image') }}
              </cy-button>
            </div>
            <div class="text-purple text-sm">{{ $lang('left menu/save load') }}</div>
            <div class="py-2 px-2">
              <save-load-data-system v-bind="SaveLoadDataSystemOptions" />
            </div>
          </div>
        </cy-transition>
      </cy-sticky-header>
      <skill-root :skill-root-state="currentSkillRootState" />
      <div class="bottom-menu">
        <div class="skill-point-information">
          <div class="column">
            <cy-icon-text iconify-name="gg-shape-rhombus" text-size="small">
              {{ $lang('skill level') }}
              <template v-slot:value>
                {{ skillPointCostSum }}
              </template>
            </cy-icon-text>
          </div>
          <div class="column">
            <cy-icon-text iconify-name="mdi:judaism"
              text-size="small" display="block">
              {{ $lang('star gem level') }}
              <template v-slot:value>
                {{ starGemSkillPointSum }}
              </template>
            </cy-icon-text>
          </div>
        </div>
        <div class="content">
          <div class="flex items-center">
            <div class="inline-flex items-center whitespace-nowrap overflow-y-auto duration-300 p-1"
              :class="{ 'opacity-0': bottomMenuExtraMenuVidsible }">
              <cy-button v-for="(state) in setButtonStates" :key="state.type"
                :iconify-name="state.icons[state.currentIndex]"
                class="my-0 p-0 border-0 mr-2"
                @click="setButtonClick(state.type)">
                {{ state.texts[state.currentIndex] }}
              </cy-button>
            </div>
            <div class="ml-auto">
              <cy-button type="icon"
                :iconify-name="bottomMenuExtraMenuVidsible ? 'heroicons-solid:menu-alt-4' : 'heroicons-solid:menu'"
                @click="bottomMenuExtraMenuVidsible = !bottomMenuExtraMenuVidsible" />
            </div>
          </div>
          <cy-transition type="fade">
            <div class="menus" v-show="bottomMenuExtraMenuVidsible">
              <div v-for="(state) in setButtonStates" :key="state.type"
                class="select-menu">
                <cy-button v-for="(value, j) in state.values" :key="value"
                  type="line" :iconify-name="state.icons[j]"
                  @click="setButtonSelected(state.type, j)"
                  :class="{ selected: state.currentIndex == j }">
                  {{ state.texts[j] }}
                </cy-button>
              </div>
            </div>
          </cy-transition>
        </div>
      </div>
      <cy-window :visible="previewExportedImageWindowVisible"
        @close-window="previewExportedImageWindowVisible = false"
        :frozen-top="true" width="auto">
        <template #title>
          <cy-flex-layout>
            <cy-icon-text iconify-name="uil:image-download">
              {{ $lang('main menu/preview exported image') }}
            </cy-icon-text>
            <template #right-content>
              <cy-button iconify-name="uil:image-download" type="border"
                class="single-line" @click="downloadExportedImage">
                {{ $globalLang('global/download') }}
              </cy-button>
            </template>
          </cy-flex-layout>
        </template>
        <div style="max-width: 28rem; border: 1px solid var(--primary-light); padding: 0.8rem; border-radius: 0.3rem; margin-bottom: 1rem">
          <cy-icon-text iconify-name="ic-outline-info" text-size="small" text-color="light-3">
            {{ $lang('main menu/preview exported image: tips 1') }}
          </cy-icon-text>
        </div>
        <div>
          <img :src="currentExportedImage || '#'" />
        </div>
      </cy-window>
      <cy-window :visible="previewExportedTextWindowVisible"
        @close-window="previewExportedTextWindowVisible = false"
        :frozen-top="true" width="auto">
        <template #title>
          <cy-flex-layout>
            <cy-icon-text iconify-name="mdi:content-copy">
              {{ $lang('main menu/preview exported text') }}
            </cy-icon-text>
            <template #right-content>
              <cy-button iconify-name="mdi:content-copy" type="border"
                class="single-line" @click="copyExportedText">
                {{ $globalLang('global/copy') }}
              </cy-button>
            </template>
          </cy-flex-layout>
        </template>
        <div class="exported-text-content" ref="previewExportedTextContent" v-html="currentExportedText"></div>
      </cy-window>
    </div>
  </article>
</template>
<script>
import CY from "@Utils/Cyteria";
import { MessageNotify, LoadingNotify } from '@Services/Notify';

import vue_skillRoot from "./skill-root.vue";
import vue_SaveLoadDataSystem from "@vue-components/SaveLoadDataSystem/main.vue";

import Vuex from 'vuex';

import { getSkillElementId } from "./utils";
import { computeDrawSkillTreeData, GetDrawSetting } from "@lib/Skill/utils/DrawSkillTree";

import init from "./init.js";

export default {
  RegisterLang: 'Skill Simulator',
  data() {
    // const r = this.skillRoot;

    const createSetButtonState = (type, icon_ids, values, current_value) => {
      return {
        type: type,
        texts: values.map(a => this.$lang('main menu/' + type + ': ' + a)),
        icons: icon_ids,
        values: values,
        currentIndex: values.indexOf(current_value)
      };
    }

    const skillPointState = {
      mode: 'normal',
      operating: '+',
      stepValue: 5
    };

    const self = this;

    return {
      skillPointState,
      drawSkillTreeOptions: {
        skillTreeType: 'level-skill-tree',
        setSkillButtonExtraData(skill, data) {
          const w = data.gridWidth;
          const { cx, cy } = data;
          const tran = data.lengthTransformFunction;

          const offset = w / 2 + 3;
          const text_yFix = 1;

          const extra_data = [];

          if (skill.level() != 0) {
            extra_data.push({
              type: 'skill-level-text',
              x: tran(cx) + offset,
              y: tran(cy) + offset + text_yFix,
              innerText: skill.level(),
              class: ['skill-level-text']
            });
          }

          if (skill.starGemLevel() != 0) {
            extra_data.push({
              type: 'star-gem-level-text',
              x: tran(cx) - offset,
              y: tran(cy) + offset + text_yFix,
              innerText: skill.starGemLevel(),
              class: ['star-gem-level-text']
            });
          }

          return extra_data;
        },
        skillCircleClickListener(e, skill) {
          const neg = self.skillPointState.operating == '-';
          const v = self.skillPointState.stepValue * (neg ? -1 : 1);
          if (self.skillPointState.mode == 'normal') {
            skill.addLevel(v);
            skill.updateTree(neg && v < 5);
          } else {
            skill.addStarGemLevel(v);
          }
        }
      },
      currentExportedImage: null,
      currentExportedText: null,
      selectSkillTreeVisible: false,
      jumpSkillTreeShowDetail: false,
      jumpSkillTreeVisible: false,
      buildInformationVisible: false,
      previewExportedImageWindowVisible: false,
      previewExportedTextWindowVisible: false,
      bottomMenuExtraMenuVidsible: false,
      setButtonStates: [
        createSetButtonState('operating', ['ic:round-add-circle-outline',
          'ic:round-remove-circle-outline'
        ], ['+', '-'], skillPointState.operating),
        createSetButtonState('step value', ['mdi:numeric-1-circle-outline',
            'mdi:numeric-5-circle-outline', 'mdi:numeric-10-circle-outline'
          ],
          [1, 5, 10], skillPointState.stepValue),
        createSetButtonState('mode', ['gg-shape-rhombus', 'mdi:judaism'],
          ['normal', 'star-gem'], skillPointState.mode)
      ],
      SaveLoadDataSystemOptions: {
        name: 'Skill Simulator',
        saveData: () => this.saveSkillBuildsCsv(),
        loadData: str => this.$store.dispatch('character/loadSkillBuildsCsv', { csvString: str }),
        saveNameList: () => {
          return this.skillRootStates.map(a => a.name);
        },
        error(e) {
          console.log(e);
        }
      }
    };
  },
  provide() {
    return {
      'drawSkillTreeOptions': this.drawSkillTreeOptions
    }
  },
  beforeCreate() {
    init();
  },
  created() {
    // this.$store.dispatch('character/loadCharacterSimulator', { index: 0, resetOption: {} });
    this.skillRootStates.length == 0 ? this.createBuild() : this.selectCurrentSkillRootState(0);
  },
  updated() {
    if (this.skillRootStates.length == 0) {
      MessageNotify(this.$lang('tips/The Number of Skill Builds is 0 due to an unknown cause detected'));
      this.createBuild();
    }
  },
  computed: {
    ...Vuex.mapState('character', {
      'skillRootStates': 'skillBuilds',
      'skillRoot': 'skillRoot',
      'currentSkillRootStateIndex': 'currentSkillBuildIndex'
    }),
    ...Vuex.mapGetters('character', {
      'saveSkillBuildsCsv': 'saveSkillBuildsCsv',
      'currentSkillRootState': 'currentSkillBuild'
    }),
    currentStarGemList() {
      const list = [];
      this.currentSkillRootState.skillTreeCategoryStates.forEach(stc => {
        stc.skillTreeStates.forEach(st => {
          st.levelSkillTree.levelSkills.forEach(skill => {
            if (skill.starGemLevel() > 0) {
              list.push({
                skill,
                skillTreeState: st
              });
            }
          });
        });
      });
      return list;
    },
    noSkillTreeSelected() {
      return this.currentSkillRootState.skillTreeCategoryStates.every(a => !a.visible);
    },
    skillPointCostSum() {
      let sum = 0;
      this.currentSkillRootState.skillTreeCategoryStates.forEach(stc => {
        if (!stc.visible) return;
        stc.skillTreeStates.forEach(st => {
          sum += this.skillTreeSkillPointCost(st);
        });
      });
      return sum;
    },
    starGemSkillPointSum() {
      let sum = 0;
      this.currentSkillRootState.skillTreeCategoryStates.forEach(stc => {
        if (!stc.visible) return;
        stc.skillTreeStates.forEach(st => {
          sum += this.skillTreeStarGemSkillPoint(st);
        });
      });
      return sum;
    },
    unemptySkillTreeCategoryStates() {
      return this.currentSkillRootState.skillTreeCategoryStates.filter(p => p.skillTreeStates.length !== 0);
    },
    visibleSkillTreeCategoryStates() {
      return this.unemptySkillTreeCategoryStates.filter(p => p.visible);
    }
  },
  methods: {
    beforeExportConfirm() {
      const t = this.visibleSkillTreeCategoryStates.length > 0;
      if (!t)
        MessageNotify(this.$lang('tips/must have at least one skill tree to export'), 'mdi-ghost', 'must have at least one skill tree to export');
      return t;
    },
    copyExportedText() {
      if (CY.copyToClipboard(this.$refs.previewExportedTextContent.innerText))
        MessageNotify(this.$globalLang('global/copy to clipboard finished'));
    },
    downloadExportedImage() {
      if (this.currentExportedImage === null) {
        MessageNotify(this.$lang('tips/download exported image: error'));
        return;
      }
      const a = document.createElement('a');
      a.setAttribute('href', this.currentExportedImage);
      a.setAttribute('download', this.currentSkillRootState.name + '.png');
      a.setAttribute('target', '_blank');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    exportCurrentBuildText() {
      if (!this.beforeExportConfirm()) return;
      let res = '',
        starGems = [];

      this.currentSkillRootState.skillTreeCategoryStates.forEach((stc) => {
        if (!stc.visible) return;
        stc.skillTreeStates.forEach((st) => {
          if (!st.visible) return;
          res += st.origin.name + '<br />';
          st.levelSkillTree.levelSkills.forEach((skill) => {
            const lv = skill.level();
            if (lv > 0)
              res += '｜' + skill.base.name + ' Lv.' + lv + '<br />';
            if (skill.starGemLevel() > 0)
              starGems.push(skill);
          });
          res += '<br />';
        });
      });
      if (starGems.length !== 0) {
        res = this.$lang('main menu/star gem list') + '<br />' +
          starGems.reduce((c, p) => c + '｜' + p.base.name + ' Lv.' + p.starGemLevel() + '<br />', '') +
          '<br />' + res;
      }

      let top = '｜' + this.$lang('exported image inner text/skill point cost sum', [this.
        skillPointCostSum
      ]) + '<br />';
      top += '｜' + this.$lang('exported image inner text/star gem skill point sum', [this.starGemSkillPointSum]) + '<br />';
      top += '<br />';

      res = top + res;

      res += this.$lang('export watermark');

      this.currentExportedText = res;
      this.previewExportedTextWindowVisible = true;
      this.buildInformationVisible = false;
    },
    async exportCurrentBuildImage() {
      if (!this.beforeExportConfirm()) return;
      const loadingNotifyItem = await LoadingNotify(this.$lang('tips/export build image: loading message'));
      try {
        const drawSetting = GetDrawSetting();

        const cur_build = this.currentSkillRootState;
        const body_cs = getComputedStyle(document.body);
        const pcolorl = body_cs.getPropertyValue('--primary-light'),
          pcolor3 = body_cs.getPropertyValue('--primary-light-3'),
          pcolor4 = body_cs.getPropertyValue('--primary-light-4'),
          fontFamily = body_cs.getPropertyValue('font-family');

        // icon
        const skillPointCostSvgIconString = `<svg crossOrigin="anonymous" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><g fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 6.343L6.343 12L12 17.657L17.657 12L12 6.343zM2.1 12l9.9 9.9l9.9-9.9L12 2.1L2.1 12z" fill="${pcolor3}"/></g></svg>`;
        const otherIconData = {
          skillPointCost: {
            src: 'data:image/svg+xml;base64,' + window.btoa(skillPointCostSvgIconString),
            loadedImage: null
          },
          potum: {
            src: '/imgs/favicon/favicon48.png',
            loadedImage: null
          },
          unknowSkillIcon: {
            src: '/imgs/skill_icons/unknow.svg',
            loadedImage: null
          }
        };
        //
        const drawDatas = [],
          main_canvases = [],
          starGemDatas = [];

        cur_build.skillTreeCategoryStates.forEach((stc) => {
          if (!stc.visible) return;
          stc.skillTreeStates.forEach((st) => {
            if (!st.visible) return;
            const drawData = computeDrawSkillTreeData(st.levelSkillTree, {
              setSkillButtonExtraData: this.drawSkillTreeOptions.setSkillButtonExtraData,
              skillTreeType: 'level-skill-tree'
            });
            drawData.skillTree = st.origin;
            drawData.levelSkillTree = st.levelSkillTree;
            drawDatas.push(drawData);
          });
        });

        Object.values(otherIconData).forEach(imgData => {
          const img = document.createElement('img');
          img.setAttribute('crossOrigin', 'anonymous');
          imgData.loadedImage = img;
        });

        await Promise.all([
          ...Object.values(otherIconData).map(imgData => {
            const img = imgData.loadedImage;
            return new Promise((resolve) => {
              img.src = imgData.src;
              img.addEventListener('load', function img_load(){
                img.removeEventListener('load', img_load);
                resolve();
              });
            });
          }),
          ...drawDatas.map(drawData => {
            return Promise.all(drawData.data
              .filter(p => p.type == 'skill-circle')
              .map(p => {
                const img = document.createElement('img');
                img.setAttribute('crossOrigin', 'anonymous');
                return new Promise((resolve) => {
                  p.skill.starGemLevel() > 0 && starGemDatas.push(p);

                  function img_load() {
                    img.removeEventListener('load', img_load);
                    img.removeEventListener('error', img_error);
                    p.loadedImage = img;
                    resolve();
                  }

                  function img_error() {
                    img.removeEventListener('load', img_load);
                    img.removeEventListener('error', img_error);
                    p.loadedImage = otherIconData.unknowSkillIcon.loadedImage;
                    resolve();
                  }
                  img.addEventListener('load', img_load);
                  img.addEventListener('error', img_error);
                  img.src = p.path;
                });
              })
            );
          })
        ]);

        const title_text_middle_y = 31,
          title_preRect_w = 3,
          title_preRect_h = 25,
          title_preRect_pdt = 16,
          title_preRect_pdl = 16,
          title_preRect_pdr = 12,
          left_icon_scope_mr = 16,
          left_icon_scope_icon_w = 16,
          // left_icon_scope_icon_pl = 12,
          left_icon_scope_text_ml = 8,
          st_extra_top_pd = 20,
          skill_icon_width = (drawSetting.gridWidth - drawSetting.iconPadding * 2),
          topInfo_topBottomPd = 20,
          topInfo_icon_h = 48,
          topInfo_icon_mr = 12,
          topInfo_text_h = 27,
          topInfo_h_sum = topInfo_topBottomPd * 2 + topInfo_text_h * 2,
          watermark_line_h = 65,
          starGemScope_topBottomPd = 16,
          sgc_margin = 10, //sgc: star gem column
          sgc_icon_mr = 10,
          sgc_w = 240,
          sgc_lineCount = Math.floor((starGemDatas.length + 1) / 2),
          sgc_icon_pd = drawSetting.iconPadding,
          starGemScope_h_sum = title_preRect_pdt + title_preRect_h +
          starGemScope_topBottomPd +
          sgc_lineCount * (skill_icon_width + sgc_icon_pd * 2) +
          (sgc_lineCount - 1) * sgc_margin +
          starGemScope_topBottomPd;

        const skillIconGrdAddColors = function(grd) {
          grd.addColorStop(0, "white");
          grd.addColorStop(0.5, "#FFD1EA");
          grd.addColorStop(1, "#f7a8d3");
        }

        const final_w = Math.max(500, ...drawDatas.map(p => p.width)),
          final_h = drawDatas.reduce(
            (c, p) => c + p.height + st_extra_top_pd,
            watermark_line_h +
            topInfo_h_sum +
            (starGemDatas.length != 0 ? starGemScope_h_sum : 0)
          );

        drawDatas.forEach(drawData => {
          const canvas = document.createElement('canvas');
          const st_w = drawData.width,
            st_h = drawData.height;
          canvas.width = final_w;
          canvas.height = st_h;
          const ctx = canvas.getContext('2d');

          drawData.data.forEach(p => {
            ctx.beginPath();
            if (p.type == 'skill-circle') {
              const grd = ctx.createLinearGradient(p.cx, p.cy - p.r, p.cx, p.cy + p.r);
              skillIconGrdAddColors(grd);
              ctx.fillStyle = grd;
              ctx.strokeStyle = '#ff5fb7';
              ctx.arc(p.cx, p.cy, p.r, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
              const ir = skill_icon_width / 2;
              ctx.drawImage(p.loadedImage, p.cx - ir, p.cy - ir, 2 * ir, 2 * ir);
            } else if (p.type == 'tree-line') {
              ctx.moveTo(p.x1, p.y1);
              ctx.lineTo(p.x2, p.y2);
              ctx.strokeStyle = pcolorl;
              ctx.lineWidth = 2;
              ctx.stroke();
            } else if (p.type == 'tree-dot') {
              ctx.strokeStyle = pcolorl;
              ctx.arc(p.cx, p.cy, p.r, 0, Math.PI * 2);
              ctx.stroke();
            } else if (p.type == 'skill-level-text' || p.type == 'star-gem-level-text') {
              ctx.font = `${CY.element.convertRemToPixels(1)}px 'Itim'`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = body_cs.getPropertyValue(
                p.type == 'skill-level-text' ?
                '--primary-light-4' : '--primary-water-blue');
              ctx.fillText(p.innerText, p.x, p.y);
            }
          });

          ctx.font = `${CY.element.convertRemToPixels(1)}px ${fontFamily}`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = pcolor4;

          // const yf = title_preRect_pdt - st_extra_top_pd;
          const title_text_y = title_text_middle_y - st_extra_top_pd;

          ctx.fillRect(title_preRect_pdl, title_preRect_pdt - st_extra_top_pd, title_preRect_w, title_preRect_h);
          ctx.fillText(drawData.skillTree.name,
            title_preRect_pdl + title_preRect_w + title_preRect_pdr, title_text_y);

          const spc = drawData.levelSkillTree.skillPointCost();
          const spc_w = ctx.measureText(spc).width;

          ctx.textAlign = 'right';
          ctx.fillText(spc, final_w - title_preRect_pdl, title_text_y + 1);
          ctx.drawImage(otherIconData.skillPointCost.loadedImage,
            final_w -
            (left_icon_scope_mr +
              left_icon_scope_text_ml +
              left_icon_scope_icon_w
            ) - spc_w,
            title_text_y - left_icon_scope_icon_w / 2);

          main_canvases.push({
            canvas: canvas,
            width: st_w,
            height: st_h
          });
        });

        const final_canvas = document.createElement('canvas');
        final_canvas.width = final_w;
        final_canvas.height = final_h;

        const fctx = final_canvas.getContext('2d');

        // background
        fctx.fillStyle = body_cs.getPropertyValue('background-color');
        fctx.fillRect(0, 0, final_w, final_h);

        // init
        let cur_y = 0;
        fctx.font = `${CY.element.convertRemToPixels(1)}px ${fontFamily}`;
        fctx.textBaseline = 'middle';
        fctx.fillStyle = pcolor4;

        fctx.textAlign = 'left';

        // top info
        {
          const spcs = this.$lang('exported image inner text/skill point cost sum', [this.skillPointCostSum]),
            sgsps = this.$lang('exported image inner text/star gem skill point sum', [this.starGemSkillPointSum]);
          const topInfo_contanier_w = Math.max(fctx.measureText(spcs).width, fctx.measureText(sgsps).width) + topInfo_icon_h + topInfo_icon_mr;
          const topInfo_icon_left = (final_w - topInfo_contanier_w) / 2,
            topInfo_icon_top = (topInfo_h_sum - topInfo_icon_h) / 2,
            topInfo_text_left = topInfo_icon_left + topInfo_icon_h + topInfo_icon_mr;

          fctx.drawImage(otherIconData.potum.loadedImage, topInfo_icon_left, topInfo_icon_top);

          cur_y += topInfo_topBottomPd + topInfo_text_h / 2;
          fctx.fillText(spcs, topInfo_text_left, cur_y);
          cur_y += topInfo_text_h;
          fctx.fillText(sgsps, topInfo_text_left, cur_y);
          cur_y += topInfo_text_h / 2 + topInfo_topBottomPd;
        }

        // star gem list
        if (starGemDatas.length > 0) {
          fctx.fillRect(title_preRect_pdl, cur_y + title_preRect_pdt, title_preRect_w, title_preRect_h);
          fctx.fillText(this.$lang('main menu/star gem list'),
            title_preRect_pdl + title_preRect_w + title_preRect_pdr, cur_y + title_text_middle_y);
          cur_y += title_preRect_pdt + title_preRect_h + starGemScope_topBottomPd;

          const sgc_left1 = (final_w - 2 * sgc_w - sgc_margin) / 2,
            sgc_left2 = sgc_left1 + sgc_w + sgc_margin,
            icon_width_sum = sgc_icon_pd * 2 + skill_icon_width;
          starGemDatas.forEach((p, i, ary) => {
            const left = i % 2 == 0 ? sgc_left1 : sgc_left2;
            const icon_mid = left + icon_width_sum / 2,
              icon_r = icon_width_sum / 2;
            const grd = fctx.createLinearGradient(icon_mid, cur_y, icon_mid, cur_y + icon_width_sum);
            skillIconGrdAddColors(grd);
            const icon_cy = cur_y + icon_r;
            fctx.beginPath();
            fctx.arc(icon_mid, icon_cy, icon_r, 0, Math.PI * 2);
            fctx.fill();
            fctx.drawImage(p.loadedImage, left + sgc_icon_pd, cur_y + sgc_icon_pd, skill_icon_width, skill_icon_width);
            fctx.fillText(p.skill.base.name + ' Lv.' + p.skill.starGemLevel(), left + icon_width_sum + sgc_icon_mr, icon_cy);
            if (i % 2 == 1 && i != ary.length - 1)
              cur_y += skill_icon_width + sgc_margin + sgc_icon_pd * 2;
          });
          cur_y += skill_icon_width + starGemScope_topBottomPd;
        }

        // all skill trees
        cur_y += st_extra_top_pd;
        fctx.strokeStyle = pcolorl;
        main_canvases.forEach(p => {
          cur_y += 1;
          fctx.beginPath();
          fctx.moveTo(0, cur_y);
          fctx.lineTo(final_w, cur_y);
          fctx.stroke();

          cur_y += (1 + st_extra_top_pd);

          fctx.drawImage(p.canvas, 0, cur_y);
          cur_y += p.height;
        });

        // watermark
        cur_y += 1;
        fctx.beginPath();
        fctx.moveTo(0, cur_y);
        fctx.lineTo(final_w, cur_y);
        fctx.stroke();
        fctx.textAlign = 'right';
        fctx.fillText(this.$lang('export watermark'), final_w - 10, cur_y + 20);

        // finale
        this.currentExportedImage = final_canvas.toDataURL('image/png', 1);
        this.previewExportedImageWindowVisible = true;
      } catch (e) {
        console.log(e);
        this.currentExportedImage = null;
        MessageNotify(this.$lang('tips/export build image: error'));
      } finally {
        this.buildInformationVisible = false;
        loadingNotifyItem.finished();
      }
    },
    deleteCurrentBuild() {
      if (this.skillRootStates.length == 1) {
        MessageNotify(this.$lang('tips/number of build cannot be less than 1'), 'ic:round-remove-circle-outline', 'number of build cannot be less than 1');
        return;
      }
      const cur_index = this.currentSkillRootStateIndex;
      const cur_build = this.currentSkillRootState;
      this.$store.commit('character/removeSkillBuild', { index: cur_index });

      MessageNotify(this.$lang('tips/delete build message', [cur_build.name]), 'ic-round-done', null, {
        buttons: [{
          text: this.$globalLang('global/recovery'),
          click: () => {
            this.$store.commit('character/createSkillBuild', { skillBuild: cur_build });
            MessageNotify(this.$lang('tips/recovery delete build message', [cur_build.name]), 'ic-round-done');
          },
          removeMessageAfterClick: true
        }]
      });

      this.buildInformationVisible = false;
    },
    copyCurrentBuild() {
      const cur_build = this.currentSkillRootState;
      const new_build = this.createBuild();

      cur_build.skillTreeCategoryStates.forEach((stc, i) => {
        if (!stc.visible) return;
        const t1 = new_build.skillTreeCategoryStates[i];
        t1.visible = true;
        stc.skillTreeStates.forEach((st, j) => {
          if (!st.visible) return;
          const t2 = t1.skillTreeStates[j];
          t2.visible = true;
          st.levelSkillTree.levelSkills.forEach((skill, k) => {
            const t3 = t2.levelSkillTree.levelSkills[k];
            t3.level(skill.level());
            t3.starGemLevel(skill.starGemLevel());
          });
        });
      });

      this.buildInformationVisible = false;
      MessageNotify(this.$lang('tips/copy build message', [cur_build.name, new_build.name], 'ic-round-done'));
    },
    selectCurrentSkillRootState(i) {
      this.$store.commit('character/setCurrentSkillBuild', { index: i });
    },
    createBuild() {
      this.$store.commit('character/createSkillBuild', {
        name: this.$lang('build') + ' ' + (this.skillRootStates.length + 1)
      });

      return this.currentSkillRootState;
    },
    skillTreeStarGemSkillPoint(st) {
      if (!st.visible) return 0;
      return st.levelSkillTree.starGemSkillPoint();
    },
    skillTreeSkillPointCost(st) {
      if (!st.visible) return 0;
      return st.levelSkillTree.skillPointCost();
    },
    toggleJumpSkillTreeShowDetail() {
      this.jumpSkillTreeShowDetail = !this.jumpSkillTreeShowDetail;
    },
    openBuildInformation() {
      this.buildInformationVisible = !this.buildInformationVisible;
      this.jumpSkillTreeVisible = false;
      this.selectSkillTreeVisible = false;
    },
    openSelectSkillTree() {
      this.selectSkillTreeVisible = !this.selectSkillTreeVisible;
      this.jumpSkillTreeVisible = false;
      this.buildInformationVisible = false;
    },
    openJumpSkillTree() {
      this.jumpSkillTreeVisible = !this.jumpSkillTreeVisible;
      this.selectSkillTreeVisible = false;
      this.buildInformationVisible = false;
    },
    toggleSkillTreeVisible(stc, st) {
      if (!st.visible) {
        stc.visible = true;
        st.visible = true;
      } else {
        stc.visible = !stc.skillTreeStates.every(a => !a.visible);
        st.visible = false;
      }
    },
    setButtonClick(type) {
      this.setButtonStates.find(p => {
        if (p.type == type) {
          p.currentIndex = p.currentIndex == p.values.length - 1 ? 0 : p.currentIndex + 1;
          this.setButtonSelected(p.type, p.currentIndex);
          return true;
        }
      });
    },
    setButtonSelected(type, index) {
      const s = this.setButtonStates.find(p => p.type == type);
      s.currentIndex = index;
      if (type == 'operating')
        this.skillPointState.operating = s.values[index];
      if (type == 'step value')
        this.skillPointState.stepValue = s.values[index];
      if (type == 'mode')
        this.skillPointState.mode = s.values[index];
    },
    jumpToSkillTree(st) {
      document.getElementById('skill-tree--' + getSkillElementId(st)).scrollIntoView({
        behavior: "smooth"
      });
      this.jumpSkillTreeVisible = false;
    }
  },
  components: {
    'skill-root': vue_skillRoot,
    'save-load-data-system': vue_SaveLoadDataSystem
  }
};
</script>
<style lang="less" scoped>

.main {
  & > .top {
    z-index: 3;

    ::v-deep(.content) {
      padding-right: 0.6rem;

      & > .buttons-scope {
        z-index: 6;
      }

      & > .inner-menu {
        position: absolute;
        top: 0.4rem;
        right: 0;
        z-index: 5;
        padding: 0.6rem 1rem;
        padding-top: 2rem;
        border: 1px solid var(--primary-light-2);
        background-color: var(--white);
        width: 31.2rem;
        max-width: 100%;
        max-height: calc(100vh - 5rem);
        overflow-y: auto;
        white-space: normal;

        & >.title {
          font-size: 0.9rem;
          margin-bottom: 0.2rem;
          color: var(--primary-light-3);
        }

        & > .content {
          display: grid;
          grid-template-columns: 50% 50%;
          margin-bottom: 0.4rem;

          @media screen and (max-width: 30rem) {
            grid-template-columns: 100%;
          }
        }
      }
    }
  }

  & > .bottom-menu {
    z-index: 2;
    position: sticky;
    bottom: 0.6rem;
    margin: 0 0.6rem;

    & > .skill-point-information {
      padding: 0.5rem 0.3rem;
      display: flex;
      align-items: center;
      justify-content: flex-end;

      & > .column {
        border: 1px solid var(--primary-light);
        padding: 0.3rem 0.6rem;
        display: inline-block;
        background-color: var(--white);
        & + .column {
          margin-left: 0.6rem;
        }
      }
    }

    & > .content {
      background-color: var(--white);
      border: 1px solid var(--primary-light-2);
      border-radius: 1.5rem;
      padding: 0.5rem 0.8rem;

      & > .menus {
        overflow-x: auto;
        display: flex;
        align-items: flex-start;
        padding-bottom: 0.4rem;
      }
    }
  }

  .inner-menu-enter-from,
  .inner-menu-leave-to {
    opacity: 0;
  }

  .inner-menu-enter-active,
  .inner-menu-leave-active {
    transition: 0.3s ease;
  }

  .exported-text-content {
    border: 1px solid var(--primary-light);
    padding: 1rem;
  }
}

// @media screen and (max-width: 30rem) {
//   .main > .top > .content > .inner-menu {
//     &>.content {
//       grid-template-columns: 100%;
//     }
//   }
// }
</style>