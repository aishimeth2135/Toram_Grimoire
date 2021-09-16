import CY from '@/shared/utils/Cyteria';
import { LevelSkill, LevelSkillTree, Skill, SkillTree } from '../Skill';

function GetDrawSetting() {
  return {
    gridWidth: 50,
    svgPadding: 40,
    textMargin: 5,
    iconPadding: 4,
  };
}

function createDrawSkillTreeDefs() {
  const defs = CY.svg.createEmpty('defs');
  defs.id = 'app--draw-skill-tree-defs';

  const w = GetDrawSetting().gridWidth,
    Circle = CY.svg.drawCircle;

  // @lock
  const lock_pettern = CY.svg.createEmpty('pattern', { width: 1, height: 1, id: 'skill-icon-lock' });
  const lock = CY.svg.create(w, w, { x: (w - 24) / 2, y: (w - 24) / 2 });
  lock.innerHTML = '<path fill="var(--primary-light)" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z"/>';
  lock_pettern.appendChild(Circle(w / 2, w / 2, w / 2, { fill: 'var(--white)', 'stroke-width': 0 }));
  lock_pettern.appendChild(lock);

  defs.appendChild(lock_pettern);

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
  setSkillButtonExtraData?: () => DrawSkillTreeData[];
}

interface DrawSkillTreeData {
  type: string;
  [key: string]: any;
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
    .replace(/([A-Z])(\d+)/g, (math, word, count) => Array(parseInt(count, 10)).fill(word).join(' '))
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
    if (cnt == skills.length)
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
            type: 'tree-line',
            x1: tran(curx),
            y1: tran(cury),
            x2: tran(curx + 1),
            y2: tran(cury),
          });
        } else if (sub === 'B') {
          data.push({
            type: 'tree-line',
            x1: tran(curx),
            y1: tran(cury),
            x2: tran(curx),
            y2: tran(cury + 1),
          });
        }
      });
      if (main === 'D') {
        data.push({
          type: 'tree-dot',
          cx: tran(curx),
          cy: tran(cury),
          r: 2,
          class: ['dot'],
        });
      } else if (main === 'S') {
        const _skill = findSkillByDrawOrder(cnt);
        const bskill = getBaseSkill(_skill);
        const name = bskill.name || '?';
        const skill_circle = {
          type: 'skill-circle',
          cx: tran(curx),
          cy: tran(cury),
          r: width / 2,
          class: ['skill-circle'],
          skill: _skill,
          path: getSkillIconPath(bskill),
        };
        let skill_name = null,
          extra_data = [];

        if (name != '?') {
          if (name != '@lock') {
            skill_name = {
              type: 'skill-name',
              x: tran(curx),
              y: tran(cury) - width / 2 - textMargin,
              innerText: name,
              class: ['skill-name'],
            };
            const patid = getSkillIconPatternId(bskill);
            skill_circle.style.fill = 'url(#' + patid + ')';
            extra_data = setSkillButtonExtraData(_skill, Object.assign({
              cx: curx,
              cy: cury,
              lengthTransformFunction: tran,
              documentFragment: t,
            }, drawData));
          } else {
            skill_circle.class.push('lock');
          }
        }
        data.push(skill_circle);
        skill_name && data.push(skill_name);

        if (!Array.isArray(extra_data)) throw Error('options: setSkillButon must return array.');
        extra_data.length > 0 && data.push(...extra_data);
        ++cnt;
      }
    }
    switch (char) {
      case 'L':
        if (curx > maxw)
          maxw = curx;
        curx = 0;
        ++cury;
        break;
      case 'E':
        ++curx;
        break;
      case 'D':
      case 'S':
        {
          p.slice(1).split('').forEach(t => {
            t == 'R' && data.push({
              type: 'tree-line',
              x1: tran(curx),
              y1: tran(cury),
              x2: tran(curx + 1),
              y2: tran(cury),
            });
            t == 'B' && data.push({
              type: 'tree-line',
              x1: tran(curx),
              y1: tran(cury),
              x2: tran(curx),
              y2: tran(cury + 1),
            });
          });
          let t;
          if (c == 'D')
            data.push({
              type: 'tree-dot',
              cx: tran(curx),
              cy: tran(cury),
              r: 2,
              class: ['dot'],
            });
          if (c == 'S') {
            const _skill = findSkillByDrawOrder(cnt);
            const bskill = getBaseSkill(_skill);
            const name = bskill.name || '?';
            const skill_circle = {
              type: 'skill-circle',
              cx: tran(curx),
              cy: tran(cury),
              r: width / 2,
              class: ['skill-circle'],
              style: {},
              skill: _skill,
              path: getSkillIconPath(bskill),
            };
            let skill_name = null,
              extra_data = [];

            if (name != '?') {
              if (name != '@lock') {
                skill_name = {
                  type: 'skill-name',
                  x: tran(curx),
                  y: tran(cury) - width / 2 - textMargin,
                  innerText: name,
                  class: ['skill-name'],
                };
                const patid = getSkillIconPatternId(bskill);
                skill_circle.style.fill = 'url(#' + patid + ')';
                extra_data = options.setSkillButtonExtraData(_skill, Object.assign({
                  cx: curx,
                  cy: cury,
                  lengthTransformFunction: tran,
                  documentFragment: t,
                }, drawData));
              } else {
                skill_circle.class.push('lock');
              }
            }
            data.push(skill_circle);
            skill_name && data.push(skill_name);

            if (!Array.isArray(extra_data)) throw Error('options: setSkillButon must return array.');
            extra_data.length > 0 && data.push(...extra_data);
            ++cnt;
          }
          ++curx;
        }
        break;
      case 'H':
        data.push({
          type: 'tree-line',
          x1: tran(curx),
          y1: tran(cury),
          x2: tran(curx + 1),
          y2: tran(cury),
        });
        ++curx;
        break;
      case 'V':
        data.push({
          type: 'tree-line',
          x1: tran(curx),
          y1: tran(cury),
          x2: tran(curx),
          y2: tran(cury + 1),
        });
        ++curx;
        break;
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

function getSkillIconPath(skill) {
  return `/imgs/skill_icons/stc_${skill.parent.parent.id}/st_${skill.parent.id}/si_${skill.id}.png`;
}

function getSkillIconPatternData(st) {
  const drawData = GetDrawSetting();
  const w = drawData.gridWidth,
    iconPad = drawData.iconPadding;

  return st.skills.filter(skill => skill.name !== '@lock')
    .map(skill => {
      return {
        id: getSkillIconPatternId(skill),
        width: 1,
        height: 1,
        elements: [{
          type: 'circle',
          cx: w / 2,
          cy: w / 2,
          r: w / 2,
          class: ['skill-icon-pattern-bg'],
        },
        {
          type: 'image',
          path: getSkillIconPath(skill),
          x: iconPad,
          y: iconPad,
          width: w - iconPad * 2,
          height: w - iconPad * 2,
        },
        ],
      };
    });
  //const pat = CY.svg.createEmpty('pattern', {id: patid, width: 1, height: 1});
  //pat.appendChild(Circle(w/2, w/2, w/2, {fill: 'url(#skill-icon-bg)', 'stroke-width': 0}));
  //pat.appendChild(CY.svg.drawImage(`${skillIconPathRoot}si_${_skill.id}.png`, iconPad, iconPad, w-iconPad*2, w-iconPad*2));
}

function getSkillIconPatternId(skill) {
  return `skill-icon-pattern--${skill.parent.parent.id}-${skill.parent.id}-${skill.id}`;
}

export { createDrawSkillTreeDefs, computeDrawSkillTreeData, getSkillIconPatternData, GetDrawSetting, getSkillIconPath };
