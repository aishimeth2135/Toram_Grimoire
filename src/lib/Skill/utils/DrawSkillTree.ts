import { CSSProperties } from 'vue';

import { Images } from '@/shared/services/Images';
import CY from '@/shared/utils/Cyteria';

import { LevelSkill, LevelSkillTree, Skill, SkillTree } from '../Skill';
import { DrawSkillTreeDataTypes } from './enums';

interface DrawSettingData {
  gridWidth: number;
  svgPadding: number;
  textMargin: number;
  iconPadding: number;
}

function GetDrawSetting(): DrawSettingData {
  return {
    gridWidth: 50,
    svgPadding: 40,
    textMargin: 5,
    iconPadding: 4,
  };
}

function createDrawSkillTreeDefs() {
  const defs = CY.svg.createEmpty('defs') as SVGDefsElement;
  defs.id = 'app--draw-skill-tree-defs';

  const w = GetDrawSetting().gridWidth;
  const drawCircle = (cx: number, cy: number, r: number) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx.toString());
    circle.setAttribute('cy', cy.toString());
    circle.setAttribute('r', r.toString());
    circle.setAttribute('fill', 'var(--white)');
    circle.setAttribute('stroke-width', '0');
    return circle;
  };

  // @lock
  const lockPattern = CY.svg.createEmpty('pattern', { width: 1, height: 1, id: 'skill-icon-lock' });
  const lock = CY.svg.create(w, w, { x: (w - 24) / 2, y: (w - 24) / 2 });
  lock.innerHTML = '<path fill="var(--primary-light)" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z"/>';
  lockPattern.appendChild(drawCircle(w / 2, w / 2, w / 2));
  lockPattern.appendChild(lock);

  defs.appendChild(lockPattern);

  // background
  const skillIconBg = CY.svg.createLinearGradient('skill-icon-bg',
    '.5', '0', '.5', '1', [
      { offset: '0%', 'stop-color': 'white' },
      { offset: '50%', 'stop-color': '#FFD1EA' },
      { offset: '100%', 'stop-color': '#f7a8d3' },
    ],
  );

  defs.appendChild(skillIconBg);

  return defs;
}

interface ComputeDrawSkillTreeDataOptions {
  setSkillButtonExtraData?: (skill: Skill | LevelSkill, drawData: DrawSkillTreeDataExtraCallbackPayload) => DrawSkillTreeData[];
}
interface DrawSkillTreeData {
  type: string;
  class?: string[];
  style?: CSSProperties;
  [key: string]: any;
}
interface DrawSkillTreeDataExtraCallbackPayload extends DrawSettingData {
  cx: number;
  cy: number;
  lengthTransformFunction: (value: number) => number;
}

function computeDrawSkillTreeData(skillTree: SkillTree | LevelSkillTree, {
  setSkillButtonExtraData = () => [],
}: ComputeDrawSkillTreeDataOptions = {}) {

  const findSkillByDrawOrder = (order: number) => {
    if (skillTree instanceof SkillTree) {
      return skillTree.skills.find(sk => sk.drawOrder === order) as Skill;
    }
    return skillTree.levelSkills.find(sk => sk.base.drawOrder === order) as LevelSkill;
  };
  const getBaseSkill = (skill: Skill | LevelSkill): Skill => {
    if (skill instanceof Skill) {
      return skill;
    }
    return skill.base;
  };

  const skills = skillTree instanceof SkillTree ? skillTree.skills : skillTree.levelSkills;
  let drawTreeCode = skillTree instanceof SkillTree ? skillTree.drawTreeCode : skillTree.base.drawTreeCode;

  drawTreeCode = drawTreeCode || 'S E S E S E S L S E S E S E S L S E S E S E S L S E S E S E S';

  const codes = drawTreeCode.toUpperCase()
    .replace(/([A-Z])(\d+)/g, (match, word, count) => Array(parseInt(count, 10)).fill(word).join(' '))
    .split(' ');
  const drawData = GetDrawSetting();
  const width = drawData.gridWidth,
    paddding = drawData.svgPadding,
    textMargin = drawData.textMargin;

  const data: DrawSkillTreeData[] = [];
  let curx = 0,
    cury = 0,
    maxw = 0,
    cnt = 0;

  const tran = (value: number) => paddding + width / 2 + value * width + textMargin;

  codes.forEach(code => {
    if (cnt === skills.length)
      return;
    const main = code.charAt(0);
    if (main === 'L') {
      if (curx > maxw)
        maxw = curx;
      curx = 0;
      cury += 1;
    } else if (main === 'E') {
      curx += 1;
    } else if (main === 'D' || main === 'S') {
      const subs = code.slice(1).split('');
      subs.forEach(sub => {
        if (sub === 'R') {
          data.push({
            type: DrawSkillTreeDataTypes.TreeLine,
            x1: tran(curx),
            y1: tran(cury),
            x2: tran(curx + 1),
            y2: tran(cury),
          });
        } else if (sub === 'B') {
          data.push({
            type: DrawSkillTreeDataTypes.TreeLine,
            x1: tran(curx),
            y1: tran(cury),
            x2: tran(curx),
            y2: tran(cury + 1),
          });
        }
      });
      if (main === 'D') {
        data.push({
          type: DrawSkillTreeDataTypes.TreeDot,
          cx: tran(curx),
          cy: tran(cury),
          r: 2,
          class: ['dot'],
        });
      } else if (main === 'S') {
        const _skill = findSkillByDrawOrder(cnt);
        const bskill = getBaseSkill(_skill);
        const name = bskill.name || '?';
        const skillCircleData = {
          type: DrawSkillTreeDataTypes.SkillCircle,
          cx: tran(curx),
          cy: tran(cury),
          r: width / 2,
          class: ['skill-circle'],
          style: {} as Record<string, string>,
          skill: _skill,
          path: getSkillIconPath(bskill),
        };
        let skillNameData = null,
          extraDatas: DrawSkillTreeData[] = [];

        if (name !== '?') {
          if (name !== '@lock') {
            skillNameData = {
              type: DrawSkillTreeDataTypes.SkillName,
              x: tran(curx),
              y: tran(cury) - width / 2 - textMargin,
              innerText: name,
              class: ['skill-name'],
            };
            const patid = getSkillIconPatternId(bskill);
            skillCircleData.style.fill = 'url(#' + patid + ')';
            extraDatas = setSkillButtonExtraData(_skill, Object.assign({
              cx: curx,
              cy: cury,
              lengthTransformFunction: tran,
            }, drawData) as DrawSkillTreeDataExtraCallbackPayload);
          } else {
            skillCircleData.class.push('lock');
          }
        }
        data.push(skillCircleData);
        skillNameData && data.push(skillNameData);

        if (!Array.isArray(extraDatas)) throw Error('options: setSkillButon must return array.');
        extraDatas.length > 0 && data.push(...extraDatas);
        cnt += 1;
      }
      curx += 1;
    } else if (main === 'H') {
      data.push({
        type: DrawSkillTreeDataTypes.TreeLine,
        x1: tran(curx),
        y1: tran(cury),
        x2: tran(curx + 1),
        y2: tran(cury),
      });
      curx += 1;
    } else if (main === 'V') {
      data.push({
        type: DrawSkillTreeDataTypes.TreeLine,
        x1: tran(curx),
        y1: tran(cury),
        x2: tran(curx),
        y2: tran(cury + 1),
      });
      curx += 1;
    }
  });

  if (curx > maxw)
    maxw = curx;

  return {
    data: data,
    width: tran(maxw) - width / 2 + paddding,
    height: tran(cury) + width / 2 + paddding + textMargin,
  };
}

function getSkillIconPath(skill: Skill): string {
  // return `/imgs/skill_icons/stc_${skill.parent.parent.id}/st_${skill.parent.id}/si_${skill.id}.png`;
  return Images.skillIcons.get(skill.skillId);
}

interface SkillIconPatternDataItem {
  id: string;
  width: number;
  height: number;
  elements: [{
    type: 'circle';
    cx: number;
    cy: number;
    r: number;
    class: string[];
  }, {
    type: 'image';
    path: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }];
}

function getSkillIconPatternData(skillTree: SkillTree | LevelSkillTree): SkillIconPatternDataItem[] {
  if (skillTree instanceof LevelSkillTree) {
    skillTree = skillTree.base;
  }
  const drawData = GetDrawSetting();
  const width = drawData.gridWidth,
    iconPad = drawData.iconPadding;

  return skillTree.skills.filter(skill => skill.name !== '@lock')
    .map(skill => {
      return {
        id: getSkillIconPatternId(skill),
        width: 1,
        height: 1,
        elements: [{
          type: 'circle',
          cx: width / 2,
          cy: width / 2,
          r: width / 2,
          class: ['skill-icon-pattern-bg'],
        }, {
          type: 'image',
          path: getSkillIconPath(skill),
          x: iconPad,
          y: iconPad,
          width: width - iconPad * 2,
          height: width - iconPad * 2,
        }],
      };
    });
}

function getSkillIconPatternId(skill: Skill): string {
  return `skill-icon-pattern--${skill.parent.parent.id}-${skill.parent.id}-${skill.id}`;
}

export {
  createDrawSkillTreeDefs,
  computeDrawSkillTreeData,
  getSkillIconPatternData,
  GetDrawSetting,
  getSkillIconPath,
};
export type { DrawSkillTreeData, DrawSkillTreeDataExtraCallbackPayload };
